import { createElement } from 'react';
import CancelledSubscriptionRedirectReturn from './cancelled-subscription-redirect-return';

export function cancelledSubscriptionReturnFromRedirect( context, next ) {
	context.primary = createElement( CancelledSubscriptionRedirectReturn );
	next();
}
