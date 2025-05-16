import { DataForm } from '@automattic/dataviews';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import type { SiteSettings } from '../../data/types';
import type { Field, SimpleFormField } from '@automattic/dataviews';
import type { UseMutationResult } from '@tanstack/react-query';

export function PrivacyForm( {
	settings,
	mutation,
}: {
	settings: SiteSettings;
	mutation: UseMutationResult< Partial< SiteSettings >, Error, Partial< SiteSettings >, unknown >;
} ) {
	const [ formData, setFormData ] = useState( settings );

	const isDirty = Object.entries( settings ).some(
		( [ key, value ] ) => formData[ key as keyof SiteSettings ] !== value
	);
	const { isPending } = mutation;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		mutation.mutate( formData );
	};

	let description;
	if ( formData.wpcom_site_visibility === 'coming-soon' ) {
		description = __(
			'Your site is hidden from visitors behind a "Coming Soon" notice until it is ready for viewing.'
		);
	} else if ( formData.wpcom_site_visibility === 'public' ) {
		description = __( 'Your site is visible to everyone.' );
	} else {
		description = __(
			'Your site is only visible to you and logged-in members you approve. Everyone else will see a log in screen.'
		);
	}

	const fields: Field< SiteSettings >[] = [
		{
			id: 'wpcom_site_visibility',
			description,
			Edit: 'toggleGroup',
			elements: [
				{ label: __( 'Coming soon' ), value: 'coming-soon' },
				{ label: __( 'Public' ), value: 'public' },
				{ label: __( 'Private' ), value: 'private' },
			],
		},
	];

	const form = {
		type: 'regular' as const,
		fields: [ { id: 'wpcom_site_visibility', labelPosition: 'none' } as SimpleFormField ],
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
