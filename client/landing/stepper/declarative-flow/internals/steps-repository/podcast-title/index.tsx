/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Button } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInput from 'calypso/components/forms/form-text-input';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { tip } from 'calypso/signup/icons';
import type { Step } from '../../types';

import './style.scss';

interface Props {
	podcastTitle?: string;
}

const PodcastTitleStep: Step = function PodcastTitleStep( { navigation } ) {
	const { goBack, submit } = navigation;
	const translate = useTranslate();

	const PodcastTitleForm: React.FC< Props > = ( { podcastTitle } ) => {
		return (
			<form className="podcast-title__form" onSubmit={ goNext }>
				<div className="podcast-title__input-wrapper">
					<FormLabel htmlFor="podcast-title">{ translate( 'My podcast is called' ) }</FormLabel>
					<div className="podcast-title__explanation">
						<FormInput id="podcast-title" value={ podcastTitle } />
						<div
							className="podcast-title__underline"
							style={ { width: podcastTitle?.length || '100%' } }
						/>
						<FormSettingExplanation>
							<Icon className="podcast-title__form-icon" icon={ tip } size={ 20 } />
							{ translate( "Don't worry, you can change it later." ) }
						</FormSettingExplanation>
					</div>
				</div>
				<Button className="podcast-title__submit-button" type="submit" primary>
					{ translate( 'Continue' ) }
				</Button>
			</form>
		);
	};

	const handleClick = () => {
		submit?.();
	};

	return (
		<StepContainer
			stepName={ 'podcast-title-step' }
			goBack={ goBack }
			hideBack
			isFullLayout
			stepContent={ <PodcastTitleForm /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default PodcastTitleStep;
