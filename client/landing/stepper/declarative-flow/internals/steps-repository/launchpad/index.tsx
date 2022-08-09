import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import Checklist from './checklist';
import { tasks } from './tasks';
import type { Step } from '../../types';
import './style.scss';

function PlaceHolderPreview() {
	return <div style={ { textAlign: 'center' } }>Preview here</div>;
}

const Launchpad: Step = ( { navigation } ) => {
	const translate = useTranslate();
	const almostReadyToLaunchText = translate( 'Almost ready to launch' );

	const stepContent = (
		<div className="launchpad__content">
			<Checklist tasks={ tasks } />
			<PlaceHolderPreview />
		</div>
	);

	return (
		<>
			<DocumentHead title={ almostReadyToLaunchText } />
			<StepContainer
				stepName={ 'launchpad' }
				goNext={ navigation.goNext }
				isWideLayout={ true }
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
