import { __ } from '@wordpress/i18n';
import type { Email } from '../types';
import type { Field } from '@wordpress/dataviews';

export const domainNameField: Field< Email > = {
	id: 'domainName',
	label: __( 'Domain' ),
	getValue: ( { item }: { item: Email } ) => item.domainName,
};
