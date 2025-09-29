import { siteBySlugQuery, siteSettingsMutation, siteSettingsQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { notFound } from '@tanstack/react-router';
import {
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
	ExternalLink,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { canViewHundredYearPlanSettings } from '../features';
import SettingsPageHeader from '../settings-page-header';
import type { SiteSettings } from '@automattic/api-core';
import type { Field, SimpleFormField } from '@wordpress/dataviews';

const fields: Field< SiteSettings >[] = [
	{
		id: 'wpcom_legacy_contact',
		label: __( 'Contact name' ),
		Edit: 'text',

		// Workaround to create additional vertical space between the two fields.
		description: ' ',
	},
	{
		id: 'wpcom_locked_mode',
		label: __( 'Enable locked mode' ),
		Edit: 'checkbox',
		description: __(
			'Prevents new posts and pages from being created as well as existing posts and pages from being edited, and closes comments site wide.'
		),
	},
];

const form = {
	layout: { type: 'regular' as const },
	fields: [ { id: 'wpcom_legacy_contact' }, { id: 'wpcom_locked_mode' } ] as SimpleFormField[],
};

export default function HundredYearPlanSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: settings } = useQuery( siteSettingsQuery( site.ID ) );
	const mutation = useMutation( {
		...siteSettingsMutation( site.ID ),
		meta: {
			snackbar: {
				success: __( 'Legacy settings saved.' ),
				error: __( 'Failed to save legacy settings.' ),
			},
		},
	} );

	const [ formData, setFormData ] = useState( {
		wpcom_legacy_contact: settings?.wpcom_legacy_contact,
		wpcom_locked_mode: settings?.wpcom_locked_mode,
	} );

	if ( ! site || ! settings ) {
		return null;
	}

	if ( ! canViewHundredYearPlanSettings( site ) ) {
		throw notFound();
	}

	const isDirty = Object.entries( formData ).some(
		( [ key, value ] ) => settings[ key as keyof SiteSettings ] !== value
	);

	const { isPending } = mutation;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		mutation.mutate( { ...formData } );
	};

	return (
		<PageLayout
			size="small"
			header={ <SettingsPageHeader title={ __( 'Control your legacy' ) } /> }
		>
			<Card>
				<CardBody>
					<form onSubmit={ handleSubmit } className="dashboard-site-settings-form">
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
		</PageLayout>
	);
}
