import { DataForm } from '@automattic/dataviews';
import { useQuery, useMutation } from '@tanstack/react-query';
import { notFound } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
	ExternalLink,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { siteQuery, siteSettingsMutation, siteSettingsQuery } from '../../app/queries';
import PageLayout from '../../components/page-layout';
import { canUpdateHundredYearPlanFeatures } from '../../utils/site-features';
import SettingsPageHeader from '../settings-page-header';
import type { SiteSettings } from '../../data/types';
import type { Field, SimpleFormField } from '@automattic/dataviews';

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
	type: 'regular' as const,
	fields: [ { id: 'wpcom_legacy_contact' }, { id: 'wpcom_locked_mode' } ] as SimpleFormField[],
};

export default function HundredYearPlanSettings( { siteSlug }: { siteSlug: string } ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { data: site } = useQuery( siteQuery( siteSlug ) );
	const { data: settings } = useQuery( siteSettingsQuery( siteSlug ) );
	const mutation = useMutation( siteSettingsMutation( siteSlug ) );

	const [ formData, setFormData ] = useState( {
		wpcom_legacy_contact: settings?.wpcom_legacy_contact,
		wpcom_locked_mode: settings?.wpcom_locked_mode,
	} );

	if ( ! site || ! settings ) {
		return null;
	}

	if ( ! canUpdateHundredYearPlanFeatures( site ) ) {
		throw notFound();
	}

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
		<PageLayout
			size="small"
			header={ <SettingsPageHeader title={ __( 'Control your legacy' ) } /> }
		>
			<Card>
				<CardBody>
					<form onSubmit={ handleSubmit } className="dashboard-site-settings-form">
						<VStack spacing={ 4 }>
							<VStack spacing={ 2 }>
								<Text size="15px" weight={ 500 }>
									{ __( 'Legacy contact' ) }
								</Text>
								<Text variant="muted" as="p">
									{ createInterpolateElement(
										__(
											'Choose someone to look after your site when you pass away. To take ownership of the site, we ask that the person you designate contacts us at <link>wordpress.com/help</link> with a copy of the death certificate.'
										),
										{
											link: <ExternalLink href="https://wordpress.com/help" children={ null } />,
										}
									) }
								</Text>
							</VStack>
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
						</VStack>
					</form>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
