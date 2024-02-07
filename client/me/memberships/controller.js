import { createElement } from 'react';
import CancelledSubscriptionRedirectReturn from './cancelled-subscription-redirect-return';
import Subscription from './subscription';

export function subscription( context, next ) {
	const subscriptionId = context.params.subscriptionId;

	if ( subscriptionId ) {
		context.primary = createElement( Subscription, { subscriptionId: subscriptionId } );
	}
	next();
}

export function cancelledSubscriptionReturnFromRedirect( context, next ) {
	context.primary = createElement( CancelledSubscriptionRedirectReturn );
	next();
}
