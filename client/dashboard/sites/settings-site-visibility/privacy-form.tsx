import { DataForm } from '@automattic/dataviews';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Card,
	CardBody,
	Button,
	CheckboxControl,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import { siteDomainsQuery } from '../../app/queries/site-domains';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import { ShareSiteForm } from './share-site-form';
import type { Site, SiteSettings } from '../../data/types';
import type { Field, Form } from '@automattic/dataviews';
import type { UseMutationResult } from '@tanstack/react-query';

const visibilityFields: Field< SiteSettings >[] = [
	{
		id: 'wpcom_site_visibility',
		Edit: 'toggleGroup',
		elements: [
			{
				label: __( 'Coming soon' ),
				value: 'coming-soon',
				description: __(
					'Your site is hidden from visitors behind a “Coming Soon” notice until it is ready for viewing.'
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

const visibilityForm = {
	type: 'regular',
	fields: [ { id: 'wpcom_site_visibility', labelPosition: 'none' } ],
} satisfies Form;

// This form also has access to `isPrimaryDomainStaging` which isn't a persisted setting, but is data
// needed to determine whether the checkboxes should be disabled.
const robotFields: Field< SiteSettings & { isPrimaryDomainStaging: boolean } >[] = [
	{
		id: 'wpcom_discourage_search_engines',
		label: __( 'Discourage search engines from indexing this site' ),
		description: __(
			'This does not block access to your site—it is up to search engines to honor your request.'
		),
		isVisible: ( { wpcom_site_visibility }: SiteSettings ) => wpcom_site_visibility === 'public',
		Edit: ( { field, onChange, data, hideLabelFromVision } ) => (
			<CheckboxControl
				__nextHasNoMarginBottom
				label={ hideLabelFromVision ? '' : field.label }
				checked={ data.isPrimaryDomainStaging || field.getValue( { item: data } ) }
				disabled={ data.isPrimaryDomainStaging }
				onChange={ () => {
					onChange( { [ field.id ]: ! field.getValue( { item: data } ) } );
				} }
				help={ field.description }
			/>
		),
	},
	{
		id: 'wpcom_prevent_third_party_sharing',
		Edit: ( { field, onChange, data, hideLabelFromVision } ) => (
			<CheckboxControl
				__nextHasNoMarginBottom
				label={ hideLabelFromVision ? '' : field.label }
				checked={ data.isPrimaryDomainStaging || field.getValue( { item: data } ) }
				disabled={ data.isPrimaryDomainStaging || data.wpcom_discourage_search_engines }
				onChange={ () => {
					onChange( { [ field.id ]: ! field.getValue( { item: data } ) } );
				} }
				help={ createInterpolateElement(
					__(
						'This will prevent this site’s content from being shared with our licensed network of content and research partners, including those that train AI models. <a>Learn more</a>'
					),
					{
						a: <InlineSupportLink supportContext="privacy-prevent-third-party-sharing" />,
					}
				) }
			/>
		),
		label: __( 'Prevent third-party sharing for this site' ),
		isVisible: ( { wpcom_site_visibility }: SiteSettings ) => wpcom_site_visibility === 'public',
	},
];

const robotForm = {
	type: 'regular',
	fields: [ 'wpcom_discourage_search_engines', 'wpcom_prevent_third_party_sharing' ],
} satisfies Form;

export function PrivacyForm( {
	site,
	settings,
	mutation,
}: {
	site: Site;
	settings: SiteSettings;
	mutation: UseMutationResult< Partial< SiteSettings >, Error, Partial< SiteSettings >, unknown >;
} ) {
	const { data: domains = [] } = useQuery( siteDomainsQuery( site.ID ) );

	const primaryDomain = domains.find( ( domain ) => domain.primary_domain );
	const isPrimaryDomainStaging = Boolean( primaryDomain?.is_wpcom_staging_domain );
	const hasNonWpcomDomain = domains.some( ( domain ) => ! domain.wpcom_domain );

	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const [ formData, setFormData ] = useState( {
		wpcom_site_visibility: settings.wpcom_site_visibility,
		wpcom_discourage_search_engines: settings.wpcom_discourage_search_engines,
		wpcom_prevent_third_party_sharing:
			settings.wpcom_discourage_search_engines || settings.wpcom_prevent_third_party_sharing,
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

	const handleChange = ( edits: Partial< SiteSettings > ) => {
		setFormData( ( data ) => {
			const newFormData = { ...data, ...edits };

			if ( edits.wpcom_site_visibility !== undefined ) {
				// Forget any previous edits to the discoverability controls when the visibility changes.
				newFormData.wpcom_discourage_search_engines = settings.wpcom_discourage_search_engines;
				newFormData.wpcom_prevent_third_party_sharing =
					settings.wpcom_discourage_search_engines || settings.wpcom_prevent_third_party_sharing;
			}
			if ( edits.wpcom_discourage_search_engines === true ) {
				// Checking the search engine box forces the third party checkbox too.
				newFormData.wpcom_prevent_third_party_sharing = true;
			}

			return newFormData;
		} );
	};

	return (
		<>
			<Card>
				<CardBody>
					<form onSubmit={ handleSubmit } className="dashboard-site-settings-privacy-form">
						<VStack spacing={ 4 }>
							<DataForm< SiteSettings >
								data={ formData }
								fields={ visibilityFields }
								form={ visibilityForm }
								onChange={ handleChange }
							/>
							{ formData.wpcom_site_visibility === 'public' && isPrimaryDomainStaging && (
								<Notice
									variant="warning"
									density="medium"
									actions={
										hasNonWpcomDomain ? (
											<Button variant="secondary" href={ `/domains/manage/${ site.slug }` }>
												{ __( 'Manage domains' ) }
											</Button>
										) : (
											<Button
												variant="secondary"
												href={ addQueryArgs( `/domains/add/${ site.slug }`, {
													redirect_to: window.location.pathname,
												} ) }
											>
												{ __( 'Add new domain' ) }
											</Button>
										)
									}
								>
									{ createInterpolateElement(
										__(
											/* translators: <domain /> is a placeholder for the site's domain name. */
											'Your site’s current primary domain is <domain />. This domain is intended for temporary use and will not be indexed by search engines. To ensure your site can be indexed, please register or connect a custom primary domain.'
										),
										{
											domain: (
												<strong style={ { overflowWrap: 'anywhere' } }>
													{ primaryDomain?.domain }
												</strong>
											),
										}
									) }
								</Notice>
							) }
							<DataForm< SiteSettings & { isPrimaryDomainStaging: boolean } >
								data={ { ...formData, isPrimaryDomainStaging } }
								fields={ robotFields }
								form={ robotForm }
								onChange={ ( { isPrimaryDomainStaging, ...edits } ) => handleChange( edits ) }
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
				</CardBody>
			</Card>

			{ settings.wpcom_site_visibility === 'coming-soon' &&
				formData.wpcom_site_visibility === 'coming-soon' && <ShareSiteForm site={ site } /> }
		</>
	);
}
