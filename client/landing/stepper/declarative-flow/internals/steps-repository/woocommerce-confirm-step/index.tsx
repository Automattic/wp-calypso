import { Button } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import FormattedHeader from 'calypso/components/formatted-header';
import { useTranslate } from 'i18n-calypso';
import type { Step } from '../../types';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

const WooCommerceConfirmStep: Step = function WooCommerceConfirmStep( { navigation } ) {
	const { goBack, submit } = navigation;

	const translate = useTranslate();
	const headerText = translate( 'One final step' );
	const subHeaderText = translate(
		'We’ve highlighted a few important details you should review before we create your store.'
	);
	return (
		<StepContainer
			stepName={ 'woocommerce-confirm-step' }
			goBack={ goBack }
			hideSkip
			isHorizontalLayout={ true }
			formattedHeader={
				<FormattedHeader
					id={ 'woocommerce-confirm-step-title-header' }
					headerText={ headerText }
					subHeaderText={ subHeaderText }
					align={ 'left' }
				/>
			}
			stepContent={ <Button onClick={ () => submit?.() }>Confirm</Button> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default WooCommerceConfirmStep;
