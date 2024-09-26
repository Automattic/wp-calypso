import { CircularProgressBar } from '@automattic/components';
import './style.scss';

type CircularPerformanceScoreProps = {
	score: number;
	size: number;
	steps?: number;
};

export const CircularPerformanceScore = ( {
	score,
	size,
	steps = 100,
}: CircularPerformanceScoreProps ) => {
	const getStatus = ( value: number ) => {
		if ( value <= 49 ) {
			return 'poor';
		} else if ( value > 49 && value < 90 ) {
			return 'needs-improvement';
		}
		return 'good';
	};

	return (
		<div className={ `circular-performance-bar ${ getStatus( score ) }` }>
			<CircularProgressBar
				currentStep={ score }
				size={ size }
				numberOfSteps={ steps }
				showProgressText={ false }
			/>
			<div
				className={ `circular-performance-score ${
					size > 48 && 'circular-performance-score--large'
				} ` }
			>
				{ score }
			</div>
		</div>
	);
};
