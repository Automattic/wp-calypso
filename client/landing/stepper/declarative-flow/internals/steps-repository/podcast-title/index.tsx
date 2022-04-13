/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Button } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { TextControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

const PodcastTitleStep: Step = function PodcastTitleStep( { navigation } ) {
	const { goBack, submit } = navigation;
	const translate = useTranslate();
	const headerText = translate( 'My podcast is called' );
	const subHeaderText = translate( "Don't worry, you can change it later." );
	const { siteTitle } = useSelect( ( select ) => select( ONBOARD_STORE ).getState() );
	const { setSiteTitle } = useDispatch( ONBOARD_STORE );

	const handleClick = () => {
		submit?.();
	};

	return (
		<StepContainer
			stepName={ 'podcast-title-step' }
			goBack={ goBack }
			hideSkip
			hideBack
			isHorizontalLayout={ true }
			formattedHeader={
				<FormattedHeader
					id={ 'podcast-title-header' }
					headerText={ headerText }
					subHeaderText={ subHeaderText }
					align={ 'left' }
				/>
			}
			stepContent={
				<>
					<TextControl onChange={ setSiteTitle } value={ siteTitle } />
					<Button onClick={ handleClick }>Continue</Button>
				</>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default PodcastTitleStep;
