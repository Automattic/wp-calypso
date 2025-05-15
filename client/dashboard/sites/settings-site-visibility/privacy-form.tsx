import { DataForm } from '@automattic/dataviews';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import type { SiteSettings } from '../../data/types';
import type { Field } from '@automattic/dataviews';
import type { UseMutationResult } from '@tanstack/react-query';

interface SitePrivacy {
	visibility: string;
}

const fields: Field< SitePrivacy >[] = [
	{
		id: 'visibility',
		Edit: ( { field, onChange, data } ) => {
			const { id, getValue } = field;
			const value = getValue( { item: data } );

			let help;
			if ( value === 'coming-soon' ) {
				help = __(
					'Your site is hidden from visitors behind a "Coming Soon" notice until it is ready for viewing.'
				);
			} else if ( value === 'public' ) {
				help = __( 'Your site is visible to everyone.' );
			} else {
				help = __(
					'Your site is only visible to you and logged-in members you approve. Everyone else will see a log in screen.'
				);
			}

			return (
				<ToggleGroupControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					isBlock
					label=""
					help={ help }
					value={ value }
					onChange={ ( newValue ) => {
						onChange( { [ id ]: newValue } );
					} }
				>
					<ToggleGroupControlOption label="Coming soon" value="coming-soon" />
					<ToggleGroupControlOption label="Public" value="public" />
					<ToggleGroupControlOption label="Private" value="private" />
				</ToggleGroupControl>
			);
		},
	},
];

const form = {
	type: 'regular' as const,
	fields,
};

function privacyToSettings( { visibility }: SitePrivacy ): Partial< SiteSettings > {
	let blog_public;
	let wpcom_public_coming_soon;

	if ( visibility === 'public' ) {
		blog_public = 1;
		wpcom_public_coming_soon = 0;
	} else if ( visibility === 'coming-soon' ) {
		blog_public = 0;
		wpcom_public_coming_soon = 1;
	} else {
		blog_public = -1;
		wpcom_public_coming_soon = 0;
	}

	return { blog_public, wpcom_public_coming_soon };
}

function settingsToPrivacy( settings: Partial< SiteSettings > ): SitePrivacy {
	const blog_public = Number( settings.blog_public );
	const wpcom_public_coming_soon = Number( settings.wpcom_public_coming_soon );

	let visibility;

	if ( blog_public === 1 || ( blog_public === 0 && ! wpcom_public_coming_soon ) ) {
		visibility = 'public';
	} else if ( wpcom_public_coming_soon ) {
		visibility = 'coming-soon';
	} else {
		visibility = 'private';
	}

	return { visibility };
}

export function PrivacyForm( {
	settings,
	mutation,
}: {
	settings: SiteSettings;
	mutation: UseMutationResult< Partial< SiteSettings >, Error, Partial< SiteSettings >, unknown >;
} ) {
	const initialData = settingsToPrivacy( settings );
	const [ formData, setFormData ] = useState< SitePrivacy >( initialData );

	const isDirty = Object.entries( initialData ).some(
		( [ key, value ] ) => formData[ key as keyof SitePrivacy ] !== value
	);
	const { isPending } = mutation;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		mutation.mutate( privacyToSettings( formData ) );
	};

	return (
		<form onSubmit={ handleSubmit }>
			<VStack spacing={ 4 }>
				<DataForm< SitePrivacy >
					data={ formData }
					fields={ fields }
					form={ form }
					onChange={ ( edits: Partial< SitePrivacy > ) => {
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
