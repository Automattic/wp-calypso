import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	ExternalLink,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Says why a new-post note arrived and points at where the subscription is managed.
 * Subscriptions are only ever changed in the Reader.
 */
export default function SubscriptionNotice() {
	return (
		<HStack justify="flex-start" spacing={ 1 } wrap>
			<Text size={ 12 } variant="muted">
				{ __( 'You’re subscribed to this site.' ) }
			</Text>
			<Text size={ 12 }>
				<ExternalLink href="https://wordpress.com/reader/subscriptions">
					{ __( 'Manage subscription' ) }
				</ExternalLink>
			</Text>
		</HStack>
	);
}
