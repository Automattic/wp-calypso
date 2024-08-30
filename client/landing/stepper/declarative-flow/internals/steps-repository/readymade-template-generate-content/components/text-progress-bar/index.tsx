import { translate } from 'i18n-calypso';
import React from 'react';
import './style.scss';

type ProgressBarProps = {
	target: number;
	text: string;
};

const getProgressBarColor = ( progress: number ) => {
	if ( progress <= 30 ) {
		return 'red';
	} else if ( progress <= 80 ) {
		return 'yellow';
	}
	return 'green';
};

const getProgressBarMessage = ( progress: number ) => {
	if ( progress <= 30 ) {
		return translate( 'Please provide more details to get better results.' );
	} else if ( progress <= 80 ) {
		return translate( 'Not bad! You are almost there. Keep going.' );
	}
	return translate( 'Great job! You are all set.' );
};

const calculateProgress = ( text: string, target: number ) => {
	return Math.min( ( text.length / target ) * 100, 100 );
};

const TextProgressBar = ( { target, text }: ProgressBarProps ) => {
	const progress = calculateProgress( text, target );
	const progressBarColor = getProgressBarColor( progress );
	const progressBarMessage = getProgressBarMessage( progress );

	return (
		<div className="readymade-progress-bar">
			<div
				className={ `progress-bar ${ progressBarColor }` }
				style={ { width: `${ progress }%` } }
			></div>
			<div className="progress-bar__text">{ progressBarMessage }</div>
		</div>
	);
};

export default TextProgressBar;
