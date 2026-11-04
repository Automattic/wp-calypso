import { DomainSummary } from '@automattic/api-core';
import { isEnabled } from '@automattic/calypso-config';
import { getDomainNameField } from './domain-name';
import { emailAddressField } from './email-address';
import { planField } from './plan';
import { statusField } from './status';
import { typeField } from './type';
import type { Email } from '../../types';
import type { Field } from '@wordpress/dataviews';

export const getFields = (
	domains: DomainSummary[],
	domainNameFilter?: string
): Field< Email >[] => [
	emailAddressField,
	getDomainNameField( domains, domainNameFilter ),
	typeField,
	...( isEnabled( 'emails/titan-tiers' ) ? [ planField ] : [] ),
	statusField,
];
