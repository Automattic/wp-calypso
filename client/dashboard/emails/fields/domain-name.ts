import { Domain } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import type { Email } from '../types';
import type { Field } from '@wordpress/dataviews';

export const getDomainNameField = ( domains: Domain[] ): Field< Email > => ( {
	id: 'domainName',
	label: __( 'Domain' ),
	getValue: ( { item }: { item: Email } ) => item.domainName,
	elements: domains.map( ( { domain } ) => ( { value: domain, label: domain } ) ),
} );
