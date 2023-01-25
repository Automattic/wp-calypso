import { useEffect, useState } from 'react';
import './style.scss';

type LoadingBar = {
	className?: string;
	progress: number;
	setProgress: ( progress: number ) => void;
};

export function LoadingBar( { className, progress, setProgress }: LoadingBar ) {
	const [ simulatedProgress, setSimulatedProgress ] = useState( progress );

	useEffect( () => {
		let timeoutReference: NodeJS.Timeout;
		if ( progress >= 0 ) {
			timeoutReference = setTimeout( () => {
				if ( progress > simulatedProgress || progress === 1 ) {
					setSimulatedProgress( progress );
				} else if ( simulatedProgress < 1 ) {
					setSimulatedProgress( ( previousProgress: number ) => {
						let newProgress = previousProgress + Math.random() * 0.04;
						// Stall at 95%, allow complete to finish up
						if ( newProgress >= 0.95 ) {
							newProgress = 0.95;
						}
						return newProgress;
					} );
				}
				// Save our simulated progress to state to persist between step changes
				setProgress( simulatedProgress );
			}, 1000 );
		}

		return () => clearTimeout( timeoutReference );
	}, [ simulatedProgress, progress, setProgress ] );

	return (
		<div className={ className }>
			<div
				className="loading-bar"
				style={
					{
						'--progress': simulatedProgress > 1 ? 1 : simulatedProgress,
					} as React.CSSProperties
				}
			/>
		</div>
	);
}
