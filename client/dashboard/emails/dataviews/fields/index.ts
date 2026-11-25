import { isEnabled } from '@automattic/calypso-config';
import { getDomainNameField } from './domain-name';
import { emailAddressField } from './email-address';
import { planField } from './plan';
import { statusField } from './status';
import { typeField } from './type';
import type { Email } from '../../types';
import type { Field } from '@wordpress/dataviews';

export const getFields = ( domainNames: string[], domainNameFilter?: string ): Field< Email >[] => [
	emailAddressField,
	getDomainNameField( domainNames, domainNameFilter ),
	typeField,
	...( isEnabled( 'emails/titan-tiers' ) ? [ planField ] : [] ),
	statusField,
];
