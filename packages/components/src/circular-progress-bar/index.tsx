import classnames from 'classnames';
import './style.scss';

const CircularProgressBar = ( {
	currentStep,
	numberOfSteps,
	size,
	enableMobileScaling = false,
}: {
	currentStep: number;
	numberOfSteps: number;
	size: number;
	enableMobileScaling?: boolean;
} ) => {
	const SIZE = size;
	const STROKE_WIDTH = 4;
	const RADIUS = SIZE / 2 - STROKE_WIDTH / 2;
	const FULL_ARC = 2 * Math.PI * RADIUS;

	return (
		<div
			role="progressbar"
			className={ classnames( 'circular__progress-bar', {
				'mobile-scaling': enableMobileScaling,
			} ) }
			style={ { width: SIZE, height: SIZE } }
		>
			<svg
				viewBox={ `0 0 ${ SIZE } ${ SIZE }` }
				style={ { width: SIZE, height: SIZE } }
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<circle
					className="circular__progress-bar-empty-circle"
					fill="none"
					cx={ SIZE / 2 }
					cy={ SIZE / 2 }
					r={ RADIUS }
					strokeWidth={ STROKE_WIDTH }
				/>
				<circle
					style={ {
						strokeDasharray: `${ FULL_ARC * ( currentStep / numberOfSteps ) }, ${ FULL_ARC }`,
					} }
					className="circular__progress-bar-fill-circle"
					fill="none"
					cx={ SIZE / 2 }
					cy={ SIZE / 2 }
					r={ RADIUS }
					strokeWidth={ STROKE_WIDTH }
				/>
			</svg>
			<div className="circular__progress-bar-text">
				{ currentStep }/{ numberOfSteps }
			</div>
		</div>
	);
};

export default CircularProgressBar;
