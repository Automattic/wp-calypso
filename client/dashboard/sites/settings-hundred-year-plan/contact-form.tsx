import { siteSettingsMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button, ExternalLink } from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import type { Site, SiteSettings } from '@automattic/api-core';
import type { Field, FormField } from '@wordpress/dataviews';

const fields: Field< SiteSettings >[] = [
	{
		id: 'wpcom_legacy_contact',
		label: __( 'Contact name' ),
		Edit: 'text',
	},
];

const form = {
	layout: { type: 'regular' as const },
	fields: [ { id: 'wpcom_legacy_contact' } ] as FormField[],
};

export default function ContactForm( { site, settings }: { site: Site; settings: SiteSettings } ) {
	const mutation = useMutation( {
		...siteSettingsMutation( site.ID ),
		meta: {
			snackbar: {
				success: __( 'Legacy contact saved.' ),
				error: __( 'Failed to save legacy contact.' ),
			},
		},
	} );

	const [ formData, setFormData ] = useState( {
		wpcom_legacy_contact: settings?.wpcom_legacy_contact,
	} );

	const isDirty = Object.entries( formData ).some(
		( [ key, value ] ) => settings[ key as keyof SiteSettings ] !== value
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
							title={ __( 'Legacy contact' ) }
							description={ createInterpolateElement(
								__(
									'Choose someone to look after your site when you pass away. To take ownership of the site, we ask that the person you designate contacts us at <link>wordpress.com/help</link> with a copy of the death certificate.'
								),
								{
									link: <ExternalLink href="/help" children={ null } />,
								}
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
