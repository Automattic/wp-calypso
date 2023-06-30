import { useState, useEffect } from 'react';

interface CountdownTimer {
	time: string;
	showTimer: boolean;
	startTimer: () => void;
}

const useCountdownTimer = ( initialSeconds = 30 ): CountdownTimer => {
	const [ seconds, setSeconds ] = useState( initialSeconds );
	const [ isActive, setIsActive ] = useState( false );

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
		setIsActive( true );
	};

	return {
		time: formatTime( seconds ),
		showTimer: isActive,
		startTimer,
	};
};

export default useCountdownTimer;
