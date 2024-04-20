import './controller.css'
import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import styled from 'styled-components'
import { ControllerCounter, CounterKeys, FormatCount, LeftRightTap } from '../../data/counts'

const CounterDiv = styled('div')`
  height: 35vh;
  width: 30vw;
  border-radius: 17vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

const CounterNumber = styled('div')`
  color: white;
  font-size: 18vh;
  width: 100%;
  text-align: center;
`

const CounterLabel = styled('div')`
  color: white;
  font-size: 3.5vw;
  width: 100%;
  text-align: center;
`

const ControllerButton = styled('button')`
  width: 100%;
  height: 40px;
  margin: 2px;
`
// protecting against really fast acting keyboards
const lastCalls = new Map<Function, number>();
const debounceBy10Ms = <T extends Function>(fn: T) => (...args: any[]) => {
  if (lastCalls.has(fn)) {
    if (Date.now() - lastCalls.get(fn)! <= 10) {
      return;
    }
  }
  lastCalls.set(fn, Date.now());
  fn(...args);
}

const IndexPage: React.FC<PageProps> = () => {
  const [remainingTime, setRemainingTime] = React.useState<number | null>(null);
  const [counts, setCounts] = React.useState<ReturnType<typeof ControllerCounter['getAllCounts']>>(ControllerCounter.getAllCounts())
  React.useEffect(() => {
    /* listening for arrow keystrokes */
    const keyListener = debounceBy10Ms((event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        ControllerCounter.registerTap(LeftRightTap.Right)
      }
      if (event.key === 'ArrowLeft') {
        ControllerCounter.registerTap(LeftRightTap.Left)
      }
    })
    addEventListener('keydown', keyListener);
    /* listening for updates to render */
    const counterListener = () => {
      setCounts(ControllerCounter.getAllCounts());
    }
    ControllerCounter.listenForCountChanges(counterListener);

    /* watching count-down */
    const interval = setInterval(() => {
      setRemainingTime(ControllerCounter.getTimeRemainingOnCounterMs());
    }, 400);
    // cleanup if the component dismounts
    return () => {
      ControllerCounter.removeListener(counterListener);
      removeEventListener('keydown', keyListener);
      clearInterval(interval);
    }
  });
  return (
    <>
      <div id="controller" style={{
        width: 'calc(100% - 8px)',
        height: 'calc(100vh - 8px)',
        display: 'flex',
        padding: '4px',
        backgroundColor: 'whitesmoke',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'space-around'
      }}>
        <h1>
          Welcome
        </h1>
        <div>
          This page acts as a controller for <a href='/counter'>the swim meet board</a> which has a bullpen and race number counter. That page is designed to scale to large and varying screen sizes.
        </div>
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'left'}}>
          <h2>Here are the current counters</h2>
          <div style={{maxWidth: '150px'}}>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
              <div><b>Bullpen</b></div> <div>{FormatCount(counts.bullpen)}</div>
            </div>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
              <div><b>Race Number</b></div> <div>{FormatCount(counts.raceNumber)}</div>
            </div>
          </div>
          <h2>Update the counters</h2>
          <div>
            Use the buttons below to update the counts. You can also use the left and right arrow keys.
            <br/>
            There are short cuts for double and triple tapping within a <b>3 second</b> window.
            {/* little count down indicator */}
            {' '}{remainingTime != null && remainingTime > 0 ? `${Math.floor(remainingTime/1000)}.${String(remainingTime/1000 - Math.floor(remainingTime/1000)).split('.').pop()?.substring(0, 2)}` : ''}
            <br/>This is meant to work with a power point clicker:
            <br/>
            <br/>
            <b>Left</b> - subtracts from bullpen <br/>
            <b>Right</b> - adds to the bullpen <br/>
            <b>Left Left</b> subtracts from race number <br/>
            <b>Right Right</b> - adds to race number <br/>
            <b>Left Left Left</b> - subtracts from both <br/>
            <b>Right Right Right</b> - adds to both <br/>
          </div>
          <div>
            <br/>
            OR use these buttons
            <div>
              <table width={"100%"}>
                <thead>
                  <tr>
                    <th>Bullpen</th>
                    <th>Race Number</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <ControllerButton onClick={() => ControllerCounter.decrementCount(CounterKeys.Bullpen)}>Subtract</ControllerButton>
                      <ControllerButton onClick={() => ControllerCounter.incrementCount(CounterKeys.Bullpen)}>Add</ControllerButton>
                    </td>
                    <td>
                      <ControllerButton onClick={() => ControllerCounter.decrementCount(CounterKeys.RaceNumber)}>Subtract</ControllerButton>
                      <ControllerButton onClick={() => ControllerCounter.incrementCount(CounterKeys.RaceNumber)}>Add</ControllerButton>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2}>
                      <ControllerButton onClick={() => {
                        ControllerCounter.decrementCount(CounterKeys.Bullpen);
                        ControllerCounter.decrementCount(CounterKeys.RaceNumber);
                      }}>Subtract both</ControllerButton>
                      <ControllerButton onClick={() => {
                        ControllerCounter.incrementCount(CounterKeys.Bullpen);
                        ControllerCounter.incrementCount(CounterKeys.RaceNumber);
                      }}>Add both</ControllerButton>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default IndexPage

export const Head: HeadFC = () => <title>Sea Lions Swim Controller</title>
