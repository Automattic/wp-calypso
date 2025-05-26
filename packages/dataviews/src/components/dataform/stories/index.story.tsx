/**
 * WordPress dependencies
 */
import { useMemo, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import DataForm from '../index';
import type { Field, Form } from '../../../types';

type SamplePost = {
	title: string;
	order: number;
	author: number;
	status: string;
	reviewer: string;
	date: string;
	birthdate: string;
	password?: string;
};

const meta = {
	title: 'DataViews/DataForm',
	component: DataForm,
	argTypes: {
		type: {
			control: { type: 'select' },
			description:
				'Chooses the default layout of each field. "regular" is the default layout.',
			options: [ 'default', 'regular', 'panel' ],
		},
		labelPosition: {
			control: { type: 'select' },
			description: 'Chooses the label position of the layout.',
			options: [ 'default', 'top', 'side', 'none' ],
		},
	},
};
export default meta;

const fields = [
	{
		id: 'title',
		label: 'Title',
		type: 'text' as const,
	},
	{
		id: 'order',
		label: 'Order',
		type: 'integer' as const,
	},
	{
		id: 'date',
		label: 'Date',
		type: 'datetime' as const,
	},
	{
		id: 'birthdate',
		label: 'Date as options',
		type: 'datetime' as const,
		elements: [
			{ value: '1970-02-23T12:00:00', label: "Jane's birth date" },
			{ value: '1950-02-23T12:00:00', label: "John's birth date" },
		],
	},
	{
		id: 'author',
		label: 'Author',
		type: 'integer' as const,
		elements: [
			{ value: 1, label: 'Jane' },
			{ value: 2, label: 'John' },
		],
	},
	{
		id: 'reviewer',
		label: 'Reviewer',
		type: 'text' as const,
		Edit: 'radio' as const,
		elements: [
			{ value: 'fulano', label: 'Fulano' },
			{ value: 'mengano', label: 'Mengano' },
			{ value: 'zutano', label: 'Zutano' },
		],
	},
	{
		id: 'status',
		label: 'Status',
		type: 'text' as const,
		Edit: 'toggleGroup' as const,
		elements: [
			{ value: 'draft', label: 'Draft' },
			{ value: 'published', label: 'Published' },
			{ value: 'private', label: 'Private' },
		],
	},
	{
		id: 'email',
		label: 'Email',
		type: 'email' as const,
	},
	{
		id: 'password',
		label: 'Password',
		type: 'text' as const,
		isVisible: ( item: SamplePost ) => {
			return item.status !== 'private';
		},
	},
	{
		id: 'sticky',
		label: 'Sticky',
		type: 'boolean',
	},
	{
		id: 'can_comment',
		label: 'Allow people to leave a comment',
		type: 'boolean' as const,
		Edit: 'checkbox',
	},
] as Field< SamplePost >[];

export const Default = ( {
	type,
	labelPosition,
}: {
	type: 'default' | 'regular' | 'panel';
	labelPosition: 'default' | 'top' | 'side' | 'none';
} ) => {
	const [ post, setPost ] = useState( {
		title: 'Hello, World!',
		order: 2,
		author: 1,
		status: 'draft',
		reviewer: 'fulano',
		email: 'hello@wordpress.org',
		date: '2021-01-01T12:00:00',
		birthdate: '1950-02-23T12:00:00',
		sticky: false,
		can_comment: false,
	} );

	const form = useMemo(
		() => ( {
			type,
			labelPosition,
			fields: [
				'title',
				'order',
				'sticky',
				'author',
				'status',
				'reviewer',
				'email',
				'password',
				'date',
				'birthdate',
				'can_comment',
			],
		} ),
		[ type, labelPosition ]
	) as Form;

	return (
		<DataForm< SamplePost >
			data={ post }
			fields={ fields }
			form={ form }
			onChange={ ( edits ) =>
				setPost( ( prev ) => ( {
					...prev,
					...edits,
				} ) )
			}
		/>
	);
};

const CombinedFieldsComponent = ( {
	type,
	labelPosition,
}: {
	type: 'default' | 'regular' | 'panel';
	labelPosition: 'default' | 'top' | 'side' | 'none';
} ) => {
	const [ post, setPost ] = useState< SamplePost >( {
		title: 'Hello, World!',
		order: 2,
		author: 1,
		status: 'draft',
		reviewer: 'fulano',
		date: '2021-01-01T12:00:00',
		birthdate: '1950-02-23T12:00:00',
	} );

	const form = useMemo(
		() => ( {
			type,
			labelPosition,
			fields: [
				'title',
				{
					id: 'status',
					label: 'Status & Visibility',
					children: [ 'status', 'password' ],
				},
				'order',
				'author',
			],
		} ),
		[ type, labelPosition ]
	) as Form;

	return (
		<DataForm< SamplePost >
			data={ post }
			fields={ fields }
			form={ form }
			onChange={ ( edits ) =>
				setPost( ( prev ) => ( {
					...prev,
					...edits,
				} ) )
			}
		/>
	);
};

export const CombinedFields = {
	title: 'DataViews/CombinedFields',
	render: CombinedFieldsComponent,
	argTypes: {
		...meta.argTypes,
	},
	args: {
		type: 'panel',
	},
};
