import { DataForm } from '@automattic/dataviews';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	CheckboxControl,
	ExternalLink,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState, useMemo } from 'react';
import type { SiteSettings, Site } from '../../data/types';
import type { Field, Form, FormField } from '@automattic/dataviews';
import type { UseMutationResult } from '@tanstack/react-query';

export function PrivacyForm( {
	site,
	settings,
	mutation,
}: {
	site: Site;
	settings: SiteSettings;
	mutation: UseMutationResult< Partial< SiteSettings >, Error, Partial< SiteSettings >, unknown >;
} ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const [ formData, setFormData ] = useState( {
		wpcom_site_visibility: settings.wpcom_site_visibility,
		wpcom_discourage_search_engines: settings.wpcom_discourage_search_engines,
		wpcom_prevent_third_party_sharing:
			settings.wpcom_discourage_search_engines || settings.wpcom_prevent_third_party_sharing,
	} );

	const fields: Field< SiteSettings >[] = useMemo(
		() => [
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
			{
				id: 'wpcom_discourage_search_engines',
				Edit: ( { field, onChange, data, hideLabelFromVision } ) => (
					<CheckboxControl
						__nextHasNoMarginBottom
						label={ hideLabelFromVision ? '' : field.label }
						checked={ field.getValue( { item: data } ) }
						onChange={ () => {
							onChange( { [ field.id ]: ! field.getValue( { item: data } ) } );
						} }
						help={ field.description }
					/>
				),
				label: __( 'Discourage search engines from indexing this site' ),
				description: __(
					'This does not block access to your site — it is up to search engines to honor your request.'
				),
			},
			{
				id: 'wpcom_prevent_third_party_sharing',
				Edit: ( { field, onChange, data, hideLabelFromVision } ) => (
					<CheckboxControl
						__nextHasNoMarginBottom
						label={ hideLabelFromVision ? '' : field.label }
						checked={ field.getValue( { item: data } ) }
						disabled={ data.wpcom_discourage_search_engines }
						onChange={ () => {
							onChange( { [ field.id ]: ! field.getValue( { item: data } ) } );
						} }
						help={ createInterpolateElement(
							__(
								'This will present this site’s content from being shared with our licensed network of content and research partners, including those that train AI models. <a>Learn more</a>'
							),
							{
								a: (
									// TODO investigate whether localizeUrl() is safe to import into dashboard
									<ExternalLink
										/* eslint-disable-next-line wpcalypso/i18n-unlocalized-url */
										href="https://wordpress.com/support/privacy-settings/make-your-website-public/#prevent-third-party-sharing"
										children={ null } // ExternalLink's children prop is marked as required
									/>
								),
							}
						) }
					/>
				),
				label: sprintf(
					/* translators: domain will be a site's domain name e.g. example.com */
					__( 'Prevent third-party sharing for %(domain)s' ),
					{ domain: new URL( site.URL ).hostname }
				),
			},
		],
		[ site.URL ]
	);

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

	const form = {
		type: 'regular',
		fields: [ { id: 'wpcom_site_visibility', labelPosition: 'none' } ] as Array<
			FormField | string
		>,
	} satisfies Form;

	if ( formData.wpcom_site_visibility === 'public' ) {
		form.fields.push( 'wpcom_discourage_search_engines' );
		form.fields.push( 'wpcom_prevent_third_party_sharing' );
	}

	return (
		<form onSubmit={ handleSubmit }>
			<VStack spacing={ 4 }>
				<DataForm< SiteSettings >
					data={ formData }
					fields={ fields }
					form={ form }
					onChange={ ( edits: Partial< SiteSettings > ) => {
						setFormData( ( data ) => {
							const newFormData = { ...data, ...edits };

							if ( edits.wpcom_site_visibility !== undefined ) {
								// Forget any previous edits to the discoverability controls when the visibility changes.
								newFormData.wpcom_discourage_search_engines =
									settings.wpcom_discourage_search_engines;
								newFormData.wpcom_prevent_third_party_sharing =
									settings.wpcom_discourage_search_engines ||
									settings.wpcom_prevent_third_party_sharing;
							}

							if ( edits.wpcom_discourage_search_engines === true ) {
								// Checking the search engine box forces the third party checkbox too.
								newFormData.wpcom_prevent_third_party_sharing = true;
							}

							return newFormData;
						} );
					} }
				/>
				<HStack justify="flex-start">
					<Button
						variant="primary"
						__next40pxDefaultSize
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
