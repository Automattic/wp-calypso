import { SiteDomain } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import type { Email } from '../types';
import type { Field } from '@wordpress/dataviews';

export const getDomainNameField = ( domains: SiteDomain[] ): Field< Email > => ( {
	id: 'domainName',
	label: __( 'Domain' ),
	getValue: ( { item }: { item: Email } ) => item.domainName,
	elements: domains.map( ( { domain } ) => ( { value: domain, label: domain } ) ),
} );
