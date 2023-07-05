import { useState, useEffect } from 'react';

interface CountdownTimer {
	time: string;
	showTimer: boolean;
	startTimer: () => void;
	limitReached: boolean;
}

const useCountdownTimer = ( initialSeconds = 30, maxLimit = 3 ): CountdownTimer => {
	const [ seconds, setSeconds ] = useState( initialSeconds );
	const [ isActive, setIsActive ] = useState( false );
	const [ timesClicked, setTimeClicked ] = useState( 0 );

	useEffect( () => {
		let interval: NodeJS.Timeout;

		if ( isActive && seconds > 0 ) {
			interval = setInterval( () => {
				setSeconds( ( prevSeconds ) => prevSeconds - 1 );
			}, 1000 );
		}

		if ( seconds === 0 ) {
			setIsActive( false );
			setSeconds( initialSeconds );
		}

		return () => clearInterval( interval );
	}, [ isActive, seconds, initialSeconds ] );

	const formatTime = ( timeInSeconds: number ): string => {
		const minutes = Math.floor( timeInSeconds / 60 );
		const seconds = timeInSeconds % 60;

		const formattedMinutes = minutes.toString();
		const formattedSeconds = seconds < 10 ? `0${ seconds }` : seconds.toString();

		return `${ formattedMinutes }:${ formattedSeconds }`;
	};

	const startTimer = (): void => {
		setTimeClicked( timesClicked + 1 );
		setIsActive( true );
	};

	return {
		time: formatTime( seconds ),
		showTimer: isActive,
		startTimer,
		limitReached: timesClicked > maxLimit,
	};
};

export default useCountdownTimer;
