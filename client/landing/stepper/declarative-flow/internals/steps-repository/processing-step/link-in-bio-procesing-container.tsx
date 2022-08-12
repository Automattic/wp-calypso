import { StepContainer } from 'calypso/../packages/onboarding/src';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

interface Props {
	getCurrentMessage: () => void;
	simulatedProgress: number;
	stepProgress:
		| {
				count: number;
				progress: number;
		  }
		| undefined;
}

const LinkInBioProcessingContainer: React.FC< Props > = ( {
	getCurrentMessage,
	simulatedProgress,
	stepProgress,
} ) => {
	return (
		<StepContainer
			shouldHideNavButtons={ true }
			hideFormattedHeader={ true }
			stepName={ 'processing-step' }
			isHorizontalLayout={ true }
			stepContent={
				<div className={ 'processing-step' }>
					<div className="image-right"></div>
					<div className="image-left"></div>
					<h1 className="processing-step__progress-step">{ getCurrentMessage() }</h1>
					<div className="processing-step__content">
						<div
							className="processing-step__progress-bar"
							style={
								{
									'--progress': simulatedProgress > 1 ? 1 : simulatedProgress,
								} as React.CSSProperties
							}
						/>
					</div>
				</div>
			}
			stepProgress={ stepProgress }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default LinkInBioProcessingContainer;
