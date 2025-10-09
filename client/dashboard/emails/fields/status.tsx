import { __ } from '@wordpress/i18n';
import { Text } from '../../components/text';
import type { Email } from '../types';
import type { Field } from '@wordpress/dataviews';

export const statusField: Field< Email > = {
	id: 'status',
	label: __( 'Status' ),
	render: ( { item }: { item: Email } ) => {
		if ( item.status === 'active' ) {
			return <Text intent="success">{ __( 'Active' ) }</Text>;
		}

		if ( item.status === 'unverified_forwards' ) {
			return <Text intent="warning">{ __( 'Pending verification' ) }</Text>;
		}

		if ( item.status === 'google_pending_tos_acceptance' ) {
			return <Text intent="warning">{ __( 'Action required' ) }</Text>;
		}

		if ( item.status === 'suspended' ) {
			return <Text intent="error">{ __( 'Expired' ) }</Text>;
		}

		// We can't handle un used mailboxes from a mailbox row because it's tied to the account.
		if ( item.status === 'unused_mailboxes' ) {
			return <Text intent="success">{ __( 'Active' ) }</Text>;
		}

		if ( item.status === 'no_subscription' ) {
			return <Text intent="error">{ __( 'No subscription' ) }</Text>;
		}

		return <Text>{ item.status }</Text>;
	},
	getValue: ( { item }: { item: Email } ) => item.status,
	// map to display values for filtering UI
	elements: [
		{ value: 'active', label: __( 'Active' ) },
		{ value: 'unverified_forwards', label: __( 'Pending verification' ) },
		{ value: 'google_pending_tos_acceptance', label: __( 'Finish setup' ) },
		{ value: 'suspended', label: __( 'Expired' ) },
	],
};
