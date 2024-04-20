import './counter.css'
import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import styled from 'styled-components'
import { ControllerCounter, FormatCount } from '../../data/counts'

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

const IndexPage: React.FC<PageProps> = () => {
  const [counts, setCounts] = React.useState<ReturnType<typeof ControllerCounter['getAllCounts']>>(ControllerCounter.getAllCounts())
  React.useEffect(() => {
    /* listening for updates to render */
    const counterListener = () => {
      setCounts(ControllerCounter.getAllCounts());
    }
    ControllerCounter.listenForCountChanges(counterListener);
    return () => {
      ControllerCounter.removeListener(counterListener);
    }
  });
  return (
    <>
      <div style={{
        width: '100%',
        height: '100vh',
        backgroundImage: `url('/static/sealionlogo.png')`,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'space-around'
      }}>
        <CounterDiv id="left-counter" className='counter' style={{
          backgroundColor: 'var(--counter-one)'
        }}>
          <CounterNumber>{FormatCount(counts.bullpen)}</CounterNumber>
          <CounterLabel><b>Bullpen</b></CounterLabel>
        </CounterDiv>
        <CounterDiv id="left-counter" className='counter' style={{
          backgroundColor: 'var(--counter-two)'
        }}>
          <CounterNumber>{FormatCount(counts.raceNumber)}</CounterNumber>
          <CounterLabel><b>Race Number</b></CounterLabel>
        </CounterDiv>

      </div>
    </>
  )
}

export default IndexPage

export const Head: HeadFC = () => <title>Sea Lions Swim</title>
