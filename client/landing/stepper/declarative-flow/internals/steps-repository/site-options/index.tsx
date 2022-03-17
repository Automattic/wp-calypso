import { StepContainer } from '@automattic/onboarding';
/* eslint-disable wpcalypso/jsx-classname-namespace */
import { useTranslate } from 'i18n-calypso';
import siteOptionsUrl from 'calypso/assets/images/onboarding/site-options.svg';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
import './style.scss';

/**
 * The intent capture step
 */
const SiteOptionsStep: Step = function SiteOptionsStep( { navigation } ) {
	const { goBack } = navigation;

	const translate = useTranslate();
	const headerText = translate( "First, let's give your blog a name" );

	return (
		<StepContainer
			headerImageUrl={ siteOptionsUrl }
			hideSkip
			goBack={ goBack }
			isHorizontalLayout={ true }
			formattedHeader={
				<FormattedHeader id={ 'site-options-header' } headerText={ headerText } align={ 'left' } />
			}
			stepContent={ <div>Site options form</div> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default SiteOptionsStep;
