import { Domain } from '@automattic/api-core';
import { getDomainNameField } from './domain-name';
import { emailAddressField } from './email-address';
import { statusField } from './status';
import { typeField } from './type';
import type { Email } from '../types';
import type { Field } from '@wordpress/dataviews';

export const getEmailFields = ( domains: Domain[] ): Field< Email >[] => [
	emailAddressField,
	getDomainNameField( domains ),
	typeField,
	statusField,
];
