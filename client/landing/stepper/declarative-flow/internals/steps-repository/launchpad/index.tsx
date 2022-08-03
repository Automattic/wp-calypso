import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
// import './style.scss';

function PlaceHolderChecklist() {
	return (
		<ul style={ { textAlign: 'center' } }>
			<li>Item 1</li>
			<li>Item 2</li>
			<li>Item 3</li>
			<li>Item 4</li>
		</ul>
	);
}

function PlaceHolderPreview() {
	return <div style={ { textAlign: 'center' } }>Preview here</div>;
}

const Launchpad: Step = ( { navigation } ) => {
	const translate = useTranslate();
	const almostReadyToLaunchText = translate( 'Almost ready to launch' );

	// TODO: Replace inline styling with classname and scss styling
	const stepContent = (
		<div style={ { display: 'flex', flexDirection: 'column', justifyContent: 'center' } }>
			<PlaceHolderChecklist />
			<PlaceHolderPreview />
		</div>
	);

	return (
		<>
			<DocumentHead title={ almostReadyToLaunchText } />
			<StepContainer
				stepName={ 'launchpad' }
				goNext={ navigation.goNext }
				skipLabelText={ translate( 'Go to Admin' ) }
				skipButtonAlign={ 'top' }
				hideBack={ true }
				stepContent={ stepContent }
				formattedHeader={
					<FormattedHeader
						id={ 'launchpad-header' }
						headerText={ <>{ almostReadyToLaunchText }</> }
					/>
				}
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default Launchpad;
