import { DataForm } from '@automattic/dataviews';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import type { SiteSettings } from '../../data/types';
import type { Field, SimpleFormField } from '@automattic/dataviews';
import type { UseMutationResult } from '@tanstack/react-query';

const fields: Field< SiteSettings >[] = [
	{
		id: 'wpcom_site_visibility',
		Edit: 'toggleGroup',
		elements: [
			{
				label: __( 'Coming soon' ),
				value: 'coming-soon',
				description: __(
					'Your site is hidden from visitors behind a "Coming Soon" notice until it is ready for viewing.'
				),
			},
			{
				label: __( 'Public' ),
				value: 'public',
				description: __( 'Your site is visible to everyone.' ),
			},
			{
				label: __( 'Private' ),
				value: 'private',
				description: __(
					'Your site is only visible to you and logged-in members you approve. Everyone else will see a log in screen.'
				),
			},
		],
	},
];

const form = {
	type: 'regular' as const,
	fields: [ { id: 'wpcom_site_visibility', labelPosition: 'none' } as SimpleFormField ],
};

export function PrivacyForm( {
	settings,
	mutation,
}: {
	settings: SiteSettings;
	mutation: UseMutationResult< Partial< SiteSettings >, Error, Partial< SiteSettings >, unknown >;
} ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const [ formData, setFormData ] = useState( {
		wpcom_site_visibility: settings.wpcom_site_visibility,
	} );

	const isDirty = Object.entries( formData ).some(
		( [ key, value ] ) => settings[ key as keyof SiteSettings ] !== value
	);
	const { isPending } = mutation;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		mutation.mutate(
			{ ...formData },
			{
				onSuccess: () => {
					createSuccessNotice( __( 'Settings saved.' ), { type: 'snackbar' } );
				},
				onError: () => {
					createErrorNotice( __( 'Failed to save settings.' ), { type: 'snackbar' } );
				},
			}
		);
	};

	return (
		<form onSubmit={ handleSubmit }>
			<VStack spacing={ 4 }>
				<DataForm< SiteSettings >
					data={ formData }
					fields={ fields }
					form={ form }
					onChange={ ( edits: Partial< SiteSettings > ) => {
						setFormData( ( data ) => ( { ...data, ...edits } ) );
					} }
				/>
				<HStack justify="flex-start">
					<Button
						variant="primary"
						type="submit"
						isBusy={ isPending }
						disabled={ isPending || ! isDirty }
					>
						{ __( 'Save' ) }
					</Button>
				</HStack>
			</VStack>
		</form>
	);
}
