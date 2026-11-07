import { __experimentalHStack as HStack, Icon, Tooltip } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { info } from '@wordpress/icons';
import { Text } from '../../../components/text';
import type { Email } from '../../types';
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

		if ( item.status === 'domain_not_connected' ) {
			const note = __(
				'This domain is no longer connected to WordPress.com, so this mailbox may not receive mail.'
			);
			return (
				<HStack spacing={ 1 } justify="flex-start" expanded={ false }>
					<Text intent="error">{ __( 'Domain not connected' ) }</Text>
					<Tooltip text={ note }>
						<Text
							variant="muted"
							role="img"
							aria-label={ note }
							tabIndex={ 0 }
							style={ { display: 'flex' } }
						>
							<Icon icon={ info } style={ { fill: 'currentColor' } } />
						</Text>
					</Tooltip>
				</HStack>
			);
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

		if ( item.status === 'pending_deletion' ) {
			return <Text intent="warning">{ __( 'Pending deletion' ) }</Text>;
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
		{ value: 'domain_not_connected', label: __( 'Domain not connected' ) },
	],
};
