import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../types';

/**
 * The wp-admin step
 */
const WpAdminStep: Step = function WpAdminStep( { navigation } ) {
	const translate = useTranslate();
	const { goNext, goBack } = navigation;
	const headerText = translate( 'Wp Admin step' );

	return (
		<StepContainer
			hideSkip
			goBack={ goBack }
			goNext={ goNext }
			hideNext={ false }
			backLabelText={ translate( 'Previous' ) }
			nextLabelText={ translate( 'Next' ) }
			isHorizontalLayout={ true }
			formattedHeader={
				<FormattedHeader id={ 'wpadmin-step-header' } headerText={ headerText } align={ 'left' } />
			}
			stepContent={ <div>WpAdmin step content</div> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default WpAdminStep;
