function App() {
    const defaultBreak = .05;
    const defaultSession = .1//25;

    const [breakLength, setBreakLength] = React.useState(defaultBreak);
    const [sessionLength, setSessionLength] = React.useState(defaultSession);
    const [timeLeft, setTimeLeft] = React.useState(sessionLength * 60);
    const [timerOn, setTimerOn] = React.useState(false);
    //const [onBreak, setOnBreak] = React.useState(false);
    const breakRef = React.useRef(false); //prefer Ref rather than State here-- Ref does not render at each value change. And we can set it without calling a 'set'

    React.useEffect(() => {
        console.table(breakLength, sessionLength, timeLeft, timerOn, breakRef.current);
    })

    const formatTime = (time) => {
        let min = Math.floor(time / 60);
        let sec = time % 60;
        return (
            ((min < 10) ? ("0" + min) : min)
            + ':' +
            ((sec < 10) ? ('0' + sec) : sec)
        );
    }

    //change break & session times, but stay between 1 & 60 inclusive
    const changeLength = (func, amount) => {
        func((prev) => {
            if ((prev + amount >= 1) && (prev + amount <= 60)) {
                //update session length time if the timer isn't active
                if (func === setSessionLength) {
                    if (!timerOn) {
                        setTimeLeft((sessionLength + amount) * 60);
                    }
                }
                return prev + amount
            } else {
                return prev
            }
        })
    }

    //reset everything to defaults
    const resetLengths = () => {
        setBreakLength(defaultBreak);
        setSessionLength(defaultSession);
        setTimeLeft(defaultSession * 60);
        setTimerOn(false);
        breakRef.current = false;
        beep.pause();
        beep.currentTime = 0;
        clearInterval(localStorage.getItem('int-id'));
    }

    //const beep = new Audio('./beepsound.wav')
    const playSound = () => {
        const beep = document.getElementById('beep')
        beep.currentTime = 0; //allows for re-trigger
        beep.play();
    }


    const controlTime = () => {
        let second = 1000;
        let date = new Date().getTime();
        let nextDate = date + second;
        //1 https://stackoverflow.com/questions/62484083/setting-an-interval-on-a-click-event-in-react-using-hooks-wont-use-updated-stat
        //2 https://stackoverflow.com/questions/53024496/state-not-updating-when-using-react-state-hook-within-setinterval
        //3 https://overreacted.io/making-setinterval-declarative-with-react-hooks/
        //on first activation, create new interval
        if (!timerOn) {
            let interval = setInterval(() => {
                date = new Date().getTime();
                if (date > nextDate) {
                    setTimeLeft((prev) => {
                        if (prev <= 0) {
                            playSound();
                            if (!breakRef.current) {
                                breakRef.current = true;
                                return breakLength*60;
                            } else {
                                breakRef.current = false;
                                return sessionLength*60;
                            }
                        }
                        return prev - 1;
                    })
                    nextDate += second;
                }
            }, 100);

            //store ID for pausing purposes
            localStorage.clear();
            localStorage.setItem('int-id', interval);
        } else {
            //clear the interval out if we just paused
            clearInterval(localStorage.getItem('int-id'));
        }
        setTimerOn(prev => !prev);
    }

    return (
        <div id="container" >
            <div id='break-label'><h4 className="display-6">Break Length</h4>
                <button id="break-decrement" onClick={() => changeLength(setBreakLength, -1)}>–</button><span id="break-length">{breakLength}</span><button id="break-increment" onClick={() => changeLength(setBreakLength, 1)}>+</button>
            </div>
            <div id='session-label'><h4 className="display-6">Session Length</h4>
                <button id="session-decrement" onClick={() => changeLength(setSessionLength, -1)}>–</button><span id="session-length">{sessionLength}</span><button id="session-increment" onClick={() => changeLength(setSessionLength, 1)}>+</button>
            </div>
            <div ><h4 className="display-5" id='timer-label'>{breakRef.current ? 'Break Timer:' : 'Session Timer:'}</h4>
                <span id="time-left">{formatTime(timeLeft)}</span>
                <br />
                <button id="start_stop" onClick={controlTime}>{!timerOn ? <i className="fa-solid fa-play"></i> : <i className="fa-solid fa-pause"></i>}</button>
                <button id="reset" onClick={resetLengths}><i className="fa-solid fa-rotate-left"></i></button>
                <audio className="clip" src='./beepsound.wav' id='beep'></audio>
            </div>

        </div>
    )
}
ReactDOM.render(<App />, document.getElementById('app'))