/**
 * Internal dependencies
 */
import type { Field, Form } from '../../../types';

export type FormData = {
	name: string;
	surname: string;
	email: string;
};

export const initialData: FormData = {
	name: 'John',
	surname: 'Doe',
	email: 'john.doe@example.com',
};

export const getFields = (): Field< FormData >[] => [
	{
		id: 'name',
		label: 'First Name',
		type: 'text',
		isValid: ( item ) => {
			return item.name.length > 2;
		},
	},
	{
		id: 'surname',
		label: 'Last Name',
		type: 'text',
		isValid: {
			isRequired: true,
		},
	},
	{
		id: 'email',
		label: 'Email Address',
		type: 'email',
		isValid: ( item ) => {
			return item.email.includes( '@' );
		},
	},
];

export const getForm = (
	type: 'regular' | 'panel',
	labelPosition: 'top' | 'side' | 'none'
): Form => ( {
	type,
	labelPosition,
	fields: [ 'name', 'surname', 'email' ],
} );
