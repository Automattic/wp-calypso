import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
	CheckboxControl,
	ExternalLink,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { siteBySlugQuery } from '../../app/queries/site';
import { siteAgencyBlogQuery } from '../../app/queries/site-agency';
import { siteSettingsMutation, siteSettingsQuery } from '../../app/queries/site-settings';
import Notice from '../../components/notice';
import PageLayout from '../../components/page-layout';
import SettingsPageHeader from '../settings-page-header';
import type { Site, SiteSettings } from '../../data/types';
import type { Field, SimpleFormField } from '@wordpress/dataviews';

export function canUpdateA4AFullyManagedSetting( site: Site ) {
	return site.is_wpcom_atomic;
}

const fields: Field< SiteSettings >[] = [
	{
		id: 'is_fully_managed_agency_site',
		label: __( 'Allow clients to use the WordPress.com Help Center and hosting features.' ),

		// Use a custom edit component instead of checkbox since we need to invert the checkbox value.
		// Allowing clients to use the WordPress.com Help Center and hosting features is when the agency site is not fully managed.
		Edit: ( { field, onChange, data, hideLabelFromVision } ) => {
			const { id, getValue } = field;
			return (
				<CheckboxControl
					__nextHasNoMarginBottom
					label={ hideLabelFromVision ? '' : field.label }
					checked={ ! getValue( { item: data } ) }
					onChange={ () => {
						onChange( { [ id ]: ! getValue( { item: data } ) } );
					} }
				/>
			);
		},
	},
];

const form = {
	layout: { type: 'regular' as const },
	fields: [ { id: 'is_fully_managed_agency_site' } as SimpleFormField ],
};

export default function SettingsAgency( { siteSlug }: { siteSlug: string } ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: siteSettings } = useQuery( siteSettingsQuery( site.ID ) );
	const { data: agencyBlog, isLoading: isLoadingAgencyBlog } = useQuery( {
		...siteAgencyBlogQuery( site.ID ),
		enabled: site.is_wpcom_atomic,
	} );
	const mutation = useMutation( siteSettingsMutation( site.ID ) );

	const [ formData, setFormData ] = useState( {
		is_fully_managed_agency_site: siteSettings?.is_fully_managed_agency_site,
	} );

	if ( ! agencyBlog && ! isLoadingAgencyBlog ) {
		throw notFound();
	}

	const isAgencyDevelopmentSite = site.is_a4a_dev_site;
	const renderContent = () => {
		if ( isAgencyDevelopmentSite ) {
			return (
				<Notice>
					{ __(
						'Clients can’t access the WordPress.com Help Center or hosting features on development sites. You may configure access after the site is launched.'
					) }
				</Notice>
			);
		}

		const isDirty =
			formData.is_fully_managed_agency_site !== siteSettings?.is_fully_managed_agency_site;

		const handleSubmit = ( e: React.FormEvent ) => {
			e.preventDefault();
			mutation.mutate(
				{ ...formData },
				{
					onSuccess: () => {
						createSuccessNotice( __( 'Agency settings saved.' ), { type: 'snackbar' } );
					},
					onError: () => {
						createErrorNotice( __( 'Failed to save agency settings.' ), { type: 'snackbar' } );
					},
				}
			);
		};

		return (
			<Card>
				<CardBody>
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
									isBusy={ mutation.isPending }
									disabled={ mutation.isPending || ! isDirty }
								>
									{ __( 'Save' ) }
								</Button>
							</HStack>
						</VStack>
					</form>
				</CardBody>
			</Card>
		);
	};

	return (
		<PageLayout
			size="small"
			header={
				<SettingsPageHeader
					title={ __( 'Agency settings' ) }
					description={ createInterpolateElement(
						__(
							'Manage the access your clients have to <helpCenterLink>WordPress.com Help Center</helpCenterLink> and <hostingFeaturesLink>hosting features</hostingFeaturesLink>.'
						),
						{
							helpCenterLink: (
								// @ts-expect-error children prop is injected by createInterpolateElement
								// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
								<ExternalLink href="https://wordpress.com/support/help-support-options/#how-to-contact-us" />
							),
							hostingFeaturesLink: (
								// @ts-expect-error children prop is injected by createInterpolateElement
								// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
								<ExternalLink href="https://developer.wordpress.com/docs/developer-tools/web-server-settings/" />
							),
						}
					) }
				/>
			}
		>
			{ renderContent() }
		</PageLayout>
	);
}
