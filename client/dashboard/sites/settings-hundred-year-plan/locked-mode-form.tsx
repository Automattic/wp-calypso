import { siteSettingsMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import type { Site, SiteSettings } from '@automattic/api-core';
import type { Field, SimpleFormField } from '@wordpress/dataviews';

const fields: Field< SiteSettings >[] = [
	{
		id: 'wpcom_locked_mode',
		label: __( 'Enable locked mode' ),
		Edit: 'checkbox',
	},
];

const form = {
	layout: { type: 'regular' as const },
	fields: [ { id: 'wpcom_locked_mode' } ] as SimpleFormField[],
};

export default function LockedModeForm( {
	site,
	settings,
}: {
	site: Site;
	settings: SiteSettings;
} ) {
	const mutation = useMutation( {
		...siteSettingsMutation( site.ID ),
		meta: {
			snackbar: {
				success: __( 'Locked mode saved.' ),
				error: __( 'Failed to save locked mode.' ),
			},
		},
	} );

	const [ formData, setFormData ] = useState( {
		wpcom_locked_mode: !! settings?.wpcom_locked_mode,
	} );

	const isDirty = Object.entries( formData ).some(
		( [ key, value ] ) => !! settings[ key as keyof SiteSettings ] !== value
	);

	const { isPending } = mutation;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		mutation.mutate( { ...formData } );
	};

	return (
		<Card>
			<CardBody>
				<form onSubmit={ handleSubmit }>
					<VStack spacing={ 4 }>
						<SectionHeader
							title={ __( 'Locked mode' ) }
							description={ __(
								'Prevents new posts and pages from being created as well as existing posts and pages from being edited, and closes comments site wide.'
							) }
							level={ 3 }
						/>
						<DataForm< SiteSettings >
							data={ formData }
							fields={ fields }
							form={ form }
							onChange={ ( edits: Partial< SiteSettings > ) => {
								setFormData( ( data ) => ( { ...data, ...edits } ) );
							} }
						/>
						<ButtonStack justify="flex-start">
							<Button
								variant="primary"
								type="submit"
								isBusy={ isPending }
								disabled={ isPending || ! isDirty }
							>
								{ __( 'Save' ) }
							</Button>
						</ButtonStack>
					</VStack>
				</form>
			</CardBody>
		</Card>
	);
}
