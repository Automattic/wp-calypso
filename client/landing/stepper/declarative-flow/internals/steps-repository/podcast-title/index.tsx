/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Button } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

const PodcastTitleStep: Step = function PodcastTitleStep( { navigation } ) {
	const { goBack, submit } = navigation;
	const translate = useTranslate();
	const headerText = translate( 'My podcast is called' );
	const subHeaderText = translate( "Don't worry, you can change it later." );

	const submitPodcastTitle = ( podcastTitle: string ) => {
		const providedDependencies = { podcastTitle };
		recordTracksEvent( 'calypso_signup_podcast_title_select', providedDependencies );
		//setPodcastTitle( podcastTitle );
		submit?.( providedDependencies, podcastTitle );
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
				<Button type="submit" primary onClick={ submitPodcastTitle }>
					{ translate( 'Continue' ) }
				</Button>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default PodcastTitleStep;
