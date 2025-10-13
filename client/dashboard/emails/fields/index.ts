import { domainNameField } from './domain-name';
import { emailAddressField } from './email-address';
import { statusField } from './status';
import { typeField } from './type';
import type { Email } from '../types';
import type { Field } from '@wordpress/dataviews';

export const emailFields: Field< Email >[] = [
	emailAddressField,
	domainNameField,
	typeField,
	statusField,
];

export { emailAddressField, domainNameField, typeField, statusField };
