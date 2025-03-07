import { ProgressBar as WPProgressBar } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useEffect, useState } from 'react';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';

type ProgressBarProps = {
	className?: string;
	progress: number;
	delta?: number;
};

export function ProgressBar( { className, progress, delta = 0.04 }: ProgressBarProps ) {
	const [ simulatedProgress, setSimulatedProgress ] = useState( progress );
	const { setProgress } = useDispatch( ONBOARD_STORE );

	useEffect( () => {
		let timeoutReference: NodeJS.Timeout;
		if ( progress >= 0 ) {
			timeoutReference = setTimeout( () => {
				setSimulatedProgress( ( previousProgress: number ) => {
					// Jump to actual progress if it's ahead or complete
					if ( progress > previousProgress || progress === 1 ) {
						setProgress( progress );
						return progress;
					}
					// Otherwise increment smoothly, stalling at 95%
					const newProgress = Math.min( 0.95, previousProgress + Math.random() * delta );
					setProgress( newProgress );
					return newProgress;
				} );
			}, 1000 );
		}

		return () => clearTimeout( timeoutReference );
	}, [ simulatedProgress, progress, setProgress, delta ] );

	return <WPProgressBar value={ simulatedProgress * 100 } className={ className } />;
}
