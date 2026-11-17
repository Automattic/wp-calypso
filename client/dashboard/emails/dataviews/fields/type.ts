import { __ } from '@wordpress/i18n';
import type { Email } from '../../types';
import type { Field } from '@wordpress/dataviews';

export const typeField: Field< Email > = {
	id: 'type',
	label: __( 'Type' ),
	render: ( { item }: { item: Email } ) =>
		item.type === 'mailbox' ? __( 'Mailbox' ) : __( 'Forwarder' ),
	getValue: ( { item }: { item: Email } ) => item.type,
	elements: [
		{ value: 'mailbox', label: __( 'Mailbox' ) },
		{ value: 'forwarding', label: __( 'Forwarder' ) },
	],
};
