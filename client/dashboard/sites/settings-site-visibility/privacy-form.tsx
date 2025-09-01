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
import { DataForm } from '@wordpress/dataviews';
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
import type { UseMutationResult } from '@tanstack/react-query';
import type { Field, Form } from '@wordpress/dataviews';

// The raw SiteSettings don't map nicely to the controls in the form. Mapping from SiteSettings to
// PrivacyFormData allows us to create a more user-friendly form.
interface PrivacyFormData {
	visibility: 'coming-soon' | 'public' | 'private';
	discourageSearchEngines: boolean;
	preventThirdPartySharing: boolean;
}

const visibilityFields: Field< PrivacyFormData >[] = [
	{
		id: 'visibility',
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
					'Your site is only visible to you and to logged-in members you approve. Everyone else will see a login screen.'
				),
			},
		],
	},
];

const visibilityForm = {
	layout: {
		type: 'regular' as const,
	},
	fields: [ { id: 'visibility', layout: { type: 'regular', labelPosition: 'none' } } ],
} satisfies Form;

// This form also has access to `isPrimaryDomainStaging` which isn't a persisted setting, but is data
// needed to determine whether the checkboxes should be disabled.
const robotFields: Field< PrivacyFormData & { isPrimaryDomainStaging: boolean } >[] = [
	{
		id: 'discourageSearchEngines',
		label: __( 'Discourage search engines from indexing this site' ),
		description: __(
			'This does not block access to your site—it is up to search engines to honor your request.'
		),
		isVisible: ( { visibility } ) => visibility === 'public',
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
		id: 'preventThirdPartySharing',
		Edit: ( { field, onChange, data, hideLabelFromVision } ) => (
			<CheckboxControl
				__nextHasNoMarginBottom
				label={ hideLabelFromVision ? '' : field.label }
				checked={ data.isPrimaryDomainStaging || field.getValue( { item: data } ) }
				disabled={ data.isPrimaryDomainStaging || data.discourageSearchEngines }
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
		isVisible: ( { visibility } ) => visibility === 'public',
	},
];

const robotForm = {
	layout: { type: 'regular' as const },
	fields: [ 'discourageSearchEngines', 'preventThirdPartySharing' ],
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

	const initialData = fromSiteSettings( settings );
	const [ formData, setFormData ] = useState( () => ( {
		...initialData,
		preventThirdPartySharing:
			initialData.discourageSearchEngines || initialData.preventThirdPartySharing,
	} ) );

	const isDirty = Object.entries( initialData ).some(
		( [ key, value ] ) => formData[ key as keyof PrivacyFormData ] !== value
	);
	const { isPending } = mutation;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		mutation.mutate( toSiteSettings( formData ), {
			onSuccess: () => {
				createSuccessNotice( __( 'Site visibility settings saved.' ), { type: 'snackbar' } );
			},
			onError: () => {
				createErrorNotice( __( 'Failed to save site visibility settings.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	const handleChange = ( edits: Partial< PrivacyFormData > ) => {
		setFormData( ( data ) => {
			const newFormData = { ...data, ...edits };

			if ( edits.visibility === 'public' ) {
				// Forget any previous edits to the discoverability controls when the visibility changes.
				newFormData.discourageSearchEngines = initialData.discourageSearchEngines;
				newFormData.preventThirdPartySharing =
					initialData.discourageSearchEngines || initialData.preventThirdPartySharing;
			}
			if ( edits.discourageSearchEngines === true ) {
				// Checking the search engine box forces the third party checkbox too.
				newFormData.preventThirdPartySharing = true;
			}

			// Ensure switching to 'coming-soon' or 'private' sets the correct values for the hidden checkbox settings.
			return fromSiteSettings( toSiteSettings( newFormData ) );
		} );
	};

	return (
		<>
			<Card>
				<CardBody>
					<form onSubmit={ handleSubmit } className="dashboard-site-settings-privacy-form">
						<VStack spacing={ 4 }>
							<DataForm< PrivacyFormData >
								data={ formData }
								fields={ visibilityFields }
								form={ visibilityForm }
								onChange={ handleChange }
							/>
							{ formData.visibility === 'public' &&
								isPrimaryDomainStaging &&
								( site.is_wpcom_staging_site ? (
									<Notice variant="warning" density="medium">
										{ __(
											'Staging sites are intended for testing purposes and will not be indexed by search engines.'
										) }
									</Notice>
								) : (
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
								) ) }
							<DataForm< PrivacyFormData & { isPrimaryDomainStaging: boolean } >
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

			{ site.is_coming_soon && formData.visibility === 'coming-soon' && (
				<ShareSiteForm site={ site } />
			) }
		</>
	);
}

function fromSiteSettings( settings: SiteSettings ): PrivacyFormData {
	const blog_public = Number( settings.blog_public );
	const wpcom_coming_soon = Number( settings.wpcom_coming_soon );
	const wpcom_public_coming_soon = Number( settings.wpcom_public_coming_soon );
	const wpcom_data_sharing_opt_out = Boolean( settings.wpcom_data_sharing_opt_out );

	let visibility: PrivacyFormData[ 'visibility' ];
	let discourageSearchEngines;

	if ( wpcom_coming_soon === 1 || wpcom_public_coming_soon === 1 ) {
		visibility = 'coming-soon';
		discourageSearchEngines = false;
	} else if ( blog_public === -1 ) {
		visibility = 'private';
		discourageSearchEngines = false;
	} else {
		visibility = 'public';
		discourageSearchEngines = blog_public === 0;
	}

	return {
		visibility,
		discourageSearchEngines,
		preventThirdPartySharing: Boolean( wpcom_data_sharing_opt_out ),
	};
}

function toSiteSettings( settings: PrivacyFormData ): Partial< SiteSettings > {
	const { visibility, discourageSearchEngines, preventThirdPartySharing } = settings;

	let blog_public;
	let wpcom_public_coming_soon;
	let wpcom_data_sharing_opt_out;

	if ( visibility === 'coming-soon' ) {
		blog_public = 0;
		wpcom_public_coming_soon = 1;
		wpcom_data_sharing_opt_out = false;
	} else if ( visibility === 'private' ) {
		blog_public = -1;
		wpcom_public_coming_soon = 0;
		wpcom_data_sharing_opt_out = false;
	} else {
		blog_public = discourageSearchEngines ? 0 : 1;
		wpcom_public_coming_soon = 0;
		wpcom_data_sharing_opt_out = preventThirdPartySharing;
	}

	return {
		blog_public,
		wpcom_public_coming_soon,
		wpcom_data_sharing_opt_out,

		// Take opportunity, while the user is switching visibility settings, to disable the legacy coming soon setting.
		wpcom_coming_soon: 0,
	};
}
