import { __ } from '@wordpress/i18n';
import type { Email } from '../../types';
import type { Field } from '@wordpress/dataviews';

export const getDomainNameField = (
	domainNames: string[],
	domainNameFilter?: string
): Field< Email > => ( {
	id: 'domainName',
	label: __( 'Domain' ),
	getValue: ( { item }: { item: Email } ) => item.domainName,
	elements: domainNames.map( ( domain ) => ( { value: domain, label: domain } ) ),
	filterBy: {
		operators: [ 'isAny' ],
		...( domainNameFilter && { isPrimary: true } ),
	},
} );
