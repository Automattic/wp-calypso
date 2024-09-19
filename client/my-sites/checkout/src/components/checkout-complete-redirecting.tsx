import { CheckoutStepBody } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';

export function CheckoutCompleteRedirecting() {
	return (
		<CheckoutStepBody
			stepId="checkout-complete-redirecting"
			isStepActive={ false }
			isStepComplete
			titleContent={ <CheckoutCompleteRedirectingTitle /> }
		/>
	);
}

function CheckoutCompleteRedirectingTitle() {
	const translate = useTranslate();
	return <>{ translate( 'Your purchase has been completed!' ) }</>;
}
