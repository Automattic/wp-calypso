import { CheckoutStepBody } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';

export function CheckoutCompleteRedirecting(): JSX.Element {
	return (
		<CheckoutStepBody
			stepId="checkout-complete-redirecting"
			isStepActive={ false }
			isStepComplete={ true }
			titleContent={ <CheckoutCompleteRedirectingTitle /> }
			completeStepContent={ <CheckoutCompleteRedirectingContent /> }
		/>
	);
}

function CheckoutCompleteRedirectingTitle(): JSX.Element {
	const translate = useTranslate();
	return <>{ translate( 'Your purchase has been completed!' ) }</>;
}

function CheckoutCompleteRedirectingContent(): JSX.Element {
	const translate = useTranslate();
	return <>{ translate( 'Please wait…' ) }</>;
}
