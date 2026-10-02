import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Says why a new-post note arrived and points at where the subscription is managed.
 * Subscriptions are only ever changed in the Reader.
 */
export default function SubscriptionNotice() {
	return (
		<div className="wpnc-simplified__subscription">
			<span>{ __( 'You’re subscribed to this site.' ) }</span>
			<ExternalLink href="https://wordpress.com/reader/subscriptions">
				{ __( 'Manage subscription' ) }
			</ExternalLink>
		</div>
	);
}
