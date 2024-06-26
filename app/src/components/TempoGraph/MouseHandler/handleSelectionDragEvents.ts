import { clamp } from "lodash"
import { SetTempoEvent } from "midifile-ts"
import { IPoint, pointAdd, pointSub } from "../../../geometry"
import { isNotUndefined } from "../../../helpers/array"
import { bpmToUSecPerBeat, uSecPerBeatToBPM } from "../../../helpers/bpm"
import { getClientPos } from "../../../helpers/mouseEvent"
import { observeDrag } from "../../../helpers/observeDrag"
import RootStore from "../../../stores/RootStore"
import { TrackEventOf } from "../../../track"
import { TempoCoordTransform } from "../../../transform"

export const handleSelectionDragEvents =
  ({
    song: { conductorTrack },
    tempoEditorStore,
    tempoEditorStore: { quantizer },
    pushHistory,
  }: RootStore) =>
  (
    e: MouseEvent,
    hitEventId: number,
    startPoint: IPoint,
    transform: TempoCoordTransform,
  ) => {
    if (conductorTrack === undefined) {
      return
    }

    pushHistory()

    if (!tempoEditorStore.selectedEventIds.includes(hitEventId)) {
      tempoEditorStore.selectedEventIds = [hitEventId]
    }

    const events = tempoEditorStore.selectedEventIds
      .map(
        (id) =>
          conductorTrack.getEventById(
            id,
          ) as unknown as TrackEventOf<SetTempoEvent>,
      )
      .filter(isNotUndefined)
      .map((e) => ({ ...e })) // copy

    const draggedEvent = events.find((ev) => ev.id === hitEventId)
    if (draggedEvent === undefined) {
      return
    }

    const start = transform.fromPosition(startPoint)
    const startClientPos = getClientPos(e)

    observeDrag({
      onMouseMove: (e) => {
        const posPx = getClientPos(e)
        const deltaPx = pointSub(posPx, startClientPos)
        const local = pointAdd(startPoint, deltaPx)
        const pos = transform.fromPosition(local)
        const deltaTick = pos.tick - start.tick
        const offsetTick =
          draggedEvent.tick +
          deltaTick -
          quantizer.round(draggedEvent.tick + deltaTick)
        const quantizedDeltaTick = deltaTick - offsetTick

        const deltaValue = pos.bpm - start.bpm

        conductorTrack.updateEvents(
          events.map((ev) => ({
            id: ev.id,
            tick: Math.max(0, Math.floor(ev.tick + quantizedDeltaTick)),
            microsecondsPerBeat: Math.floor(
              bpmToUSecPerBeat(
                clamp(
                  uSecPerBeatToBPM(ev.microsecondsPerBeat) + deltaValue,
                  0,
                  transform.maxBPM,
                ),
              ),
            ),
          })),
        )
      },
    })
  }
