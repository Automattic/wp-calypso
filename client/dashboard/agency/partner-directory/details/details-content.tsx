import {
	agencyPartnerDirectoryLogoMutation,
	agencyProfileMutation,
	wooCountryRegionsQuery,
} from '@automattic/api-queries';
import { formatCurrency } from '@automattic/number-formatters';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	BaseControl,
	Button,
	ComboboxControl,
	ExternalLink,
	SelectControl,
	TextareaControl,
	TextControl,
	ToggleControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useEffect, useMemo, useRef, useState } from 'react';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import { ButtonStack } from '../../../components/button-stack';
import { Card, CardBody } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import { Text } from '../../../components/text';
import {
	BUDGET_LOWER_RANGES,
	getAvailableIndustries,
	getAvailableLanguages,
	getAvailableProducts,
	getAvailableServices,
	OLD_INDUSTRIES,
} from '../options';
import TokenSelector from '../token-selector';
import LogoPicker from './logo-picker';
import useDetailsForm, { getDetailsFormData } from './use-details-form';
import useDetailsFormValidation from './use-details-form-validation';
import type { Agency, AgencyProfile } from '@automattic/api-core';
import type { ReactElement } from 'react';

const LOGO_GUIDELINES_URL =
	'https://agencieshelp.automattic.com/knowledge-base/add-a-logo-to-your-partner-directory-profile/';
const MARKDOWN_HELP_URL = 'https://commonmark.org/help/';

/**
 * The minimal agency shape the details form needs. Kept structural so both
 * the dashboard (`@automattic/api-core` agency) and the A4A client (Redux
 * agency) can provide it.
 */
interface PartnerDirectoryDetailsAgency {
	id: number;
	profile?: AgencyProfile | null;
}

export type DetailsSubmitFailure = 'logo-upload' | 'save';

interface Props {
	agency: PartnerDirectoryDetailsAgency;
	recordTracksEvent: ( eventName: string, properties?: Record< string, unknown > ) => void;
	onSubmitSuccess?: ( agency: Agency ) => void;
	onSubmitError?: ( failure: DetailsSubmitFailure ) => void;
	openSupportGuide?: ( url: string ) => void;
}

/*
 * Shared by the dashboard snackbar and the classic app's notices so the two
 * hosts can't drift apart.
 */
export const getProfileSavedMessage = () => __( 'Profile saved.' );
export const getProfileSaveFailedMessage = () => __( 'Failed to save profile.' );
export const getLogoUploadFailedMessage = () => __( 'Failed to upload logo.' );

export const getDetailsDescription = ( expertiseLink: ReactElement ) =>
	createInterpolateElement(
		__(
			'Add details to your agency’s public profile for clients to see. <a>Want to update your expertise instead?</a>'
		),
		{ a: expertiseLink }
	);

export default function PartnerDirectoryDetailsContent( {
	agency,
	recordTracksEvent,
	onSubmitSuccess,
	onSubmitError,
	openSupportGuide,
}: Props ) {
	const initialFormData = getDetailsFormData( agency.profile );
	const hasProfile = initialFormData !== null;

	const { formData, setFormFields } = useDetailsForm( { initialFormData } );
	const { validate, validationError, updateValidationError } = useDetailsFormValidation();

	// A locally picked logo is only uploaded when the form is saved.
	const [ logoFile, setLogoFile ] = useState< File | null >( null );
	const logoPreviewUrl = useMemo(
		() => ( logoFile ? URL.createObjectURL( logoFile ) : null ),
		[ logoFile ]
	);
	useEffect( () => {
		return () => {
			if ( logoPreviewUrl ) {
				URL.revokeObjectURL( logoPreviewUrl );
			}
		};
	}, [ logoPreviewUrl ] );

	const { data: countryRegions } = useQuery( wooCountryRegionsQuery() );

	const { mutateAsync: uploadLogo, isPending: isUploadingLogo } = useMutation(
		withSnackbar( agencyPartnerDirectoryLogoMutation( agency.id ), {
			error: getLogoUploadFailedMessage(),
		} )
	);
	const { mutate: saveProfile, isPending: isSaving } = useMutation(
		withSnackbar( agencyProfileMutation( agency.id ), {
			success: getProfileSavedMessage(),
			error: getProfileSaveFailedMessage(),
		} )
	);
	const isSubmitting = isUploadingLogo || isSaving;

	const contentRef = useRef< HTMLDivElement >( null );

	const availableIndustries = getAvailableIndustries();
	const availableServices = getAvailableServices();
	const availableProducts = getAvailableProducts();
	const availableLanguages = getAvailableLanguages();

	// The countries/states endpoint lists states as "US:TX" entries with
	// "United States (US) — Texas" labels; keep one entry per country.
	const countryOptions = useMemo( () => {
		const options = new Map< string, string >();
		for ( const [ code, label ] of Object.entries( countryRegions ?? {} ) ) {
			const [ countryCode ] = code.split( ':' );
			if ( ! options.has( countryCode ) ) {
				options.set( countryCode, label.split( ' — ' )[ 0 ] );
			}
		}
		return Array.from( options, ( [ value, label ] ) => ( { value, label } ) ).sort( ( a, b ) =>
			a.label.localeCompare( b.label )
		);
	}, [ countryRegions ] );

	const displayIndustries = Array.from(
		new Set( formData.industries.map( ( slug ) => OLD_INDUSTRIES[ slug ] ?? slug ) )
	);

	const budgetOptions = BUDGET_LOWER_RANGES.map( ( value ) => ( {
		value,
		label:
			value === '0'
				? __( 'No minimum budget' )
				: formatCurrency( Number( value ), 'USD', { stripZeros: true } ),
	} ) );

	const submitForm = async () => {
		recordTracksEvent( 'calypso_a4a_partner_directory_details_submit_click', {
			is_update: hasProfile,
		} );

		const error = validate( formData );
		if ( error ) {
			// Errors can render far above the Save button. Once they render,
			// bring the first failing field — not just its message — into
			// view; `nearest` keeps the page still when it is already visible.
			requestAnimationFrame( () => {
				const message = contentRef.current?.querySelector( '.dashboard-text--error' );
				const field = message?.closest( '.components-base-control' ) ?? message?.parentElement;
				( field ?? message )?.scrollIntoView( { behavior: 'smooth', block: 'nearest' } );
			} );
			return;
		}

		let logoUrl = formData.logoUrl;
		if ( logoFile ) {
			try {
				const upload = await uploadLogo( logoFile );
				logoUrl = upload.url;
				// Keep the uploaded URL so a failed save retried later doesn't
				// upload the same file again.
				setFormFields( { logoUrl } );
				setLogoFile( null );
			} catch {
				onSubmitError?.( 'logo-upload' );
				return;
			}
		}

		saveProfile(
			{
				profile_company_name: formData.name,
				profile_company_email: formData.email,
				profile_company_website: formData.website,
				profile_company_bio_description: formData.bioDescription,
				profile_company_logo_url: logoUrl,
				profile_company_landing_page_url: formData.landingPageUrl,
				profile_company_country: formData.country,
				profile_listing_is_global: formData.isGlobal,
				profile_listing_is_available: formData.isAvailable,
				profile_listing_industries: formData.industries,
				profile_listing_languages_spoken: formData.languagesSpoken,
				profile_listing_services: formData.services,
				profile_listing_products: formData.products,
				profile_budget_budget_lower_range: formData.budgetLowerRange,
			},
			{
				onSuccess: ( updatedAgency ) => onSubmitSuccess?.( updatedAgency ),
				onError: () => onSubmitError?.( 'save' ),
			}
		);
	};

	const supportGuideLink = ( url: string ) =>
		openSupportGuide ? (
			<Button variant="link" onClick={ () => openSupportGuide( url ) } children={ null } />
		) : (
			<ExternalLink href={ url } children={ null } />
		);

	return (
		<VStack ref={ contentRef } spacing={ 8 }>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader level={ 3 } title={ __( 'Agency information' ) } />

						<TextControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							autoComplete="off"
							label={ __( 'Company name' ) }
							value={ formData.name }
							onChange={ ( name ) => {
								setFormFields( { name } );
								updateValidationError( { name: undefined } );
							} }
							help={
								<VStack spacing={ 1 } as="span">
									{ validationError.name && <Text intent="error">{ validationError.name }</Text> }
									<Text variant="muted">
										{ __(
											'Include only your company name; save any descriptors for the Company bio section.'
										) }
									</Text>
								</VStack>
							}
						/>

						<TextControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							autoComplete="off"
							label={ __( 'Company email' ) }
							value={ formData.email }
							onChange={ ( email ) => {
								setFormFields( { email } );
								updateValidationError( { email: undefined } );
							} }
							help={
								<VStack spacing={ 1 } as="span">
									{ validationError.email && <Text intent="error">{ validationError.email }</Text> }
									<Text variant="muted">
										{ __( 'Client inquiries and leads will go to this email.' ) }
									</Text>
								</VStack>
							}
						/>

						<TextControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							autoComplete="off"
							label={ __( 'Company website' ) }
							value={ formData.website }
							onChange={ ( website ) => {
								setFormFields( { website } );
								updateValidationError( { website: undefined } );
							} }
							help={
								validationError.website && <Text intent="error">{ validationError.website }</Text>
							}
						/>

						<TextControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ __( 'Clients’ landing page (optional)' ) }
							value={ formData.landingPageUrl }
							onChange={ ( landingPageUrl ) => {
								setFormFields( { landingPageUrl } );
								updateValidationError( { landingPage: undefined } );
							} }
							help={
								<VStack spacing={ 1 } as="span">
									{ validationError.landingPage && (
										<Text intent="error">{ validationError.landingPage }</Text>
									) }
									<Text variant="muted">
										{ __(
											'Include your custom landing page for leads from Automattic platforms. We’ll direct clients to this page.'
										) }
									</Text>
								</VStack>
							}
						/>

						<TextareaControl
							__nextHasNoMarginBottom
							label={ __( 'Company bio' ) }
							value={ formData.bioDescription }
							onChange={ ( bioDescription ) => {
								setFormFields( { bioDescription } );
								updateValidationError( { bio: undefined } );
							} }
							help={
								<VStack spacing={ 1 } as="span">
									{ validationError.bio && <Text intent="error">{ validationError.bio }</Text> }
									<Text variant="muted">
										{ createInterpolateElement(
											__( 'Basic Markdown syntax is supported. <a>Learn more about Markdown.</a>' ),
											{
												a: <ExternalLink href={ MARKDOWN_HELP_URL } children={ null } />,
											}
										) }
									</Text>
								</VStack>
							}
						/>

						<ComboboxControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ __( 'Company location' ) }
							value={ formData.country }
							options={ countryOptions }
							onChange={ ( country ) => {
								setFormFields( { country: country ?? '' } );
								updateValidationError( { country: undefined } );
							} }
							help={
								validationError.country && <Text intent="error">{ validationError.country }</Text>
							}
						/>

						<VStack spacing={ 2 }>
							<VStack spacing={ 1 }>
								<BaseControl.VisualLabel style={ { marginBottom: 0 } }>
									{ __( 'Company logo (optional)' ) }
								</BaseControl.VisualLabel>
								<Text variant="muted">
									{ __(
										'Upload your agency logo sized at 800px by 320px. Format allowed: JPG, PNG'
									) }
								</Text>
							</VStack>
							<LogoPicker
								logo={ logoPreviewUrl ?? formData.logoUrl }
								onPick={ ( file ) => setLogoFile( file ) }
							/>
							<Text variant="muted">
								{ createInterpolateElement( __( 'Need help? <a>View our logo guidelines.</a>' ), {
									a: supportGuideLink( LOGO_GUIDELINES_URL ),
								} ) }
							</Text>
						</VStack>
					</VStack>
				</CardBody>
			</Card>

			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader
							level={ 3 }
							title={ __( 'Listing details' ) }
							description={ __( 'Clients can filter these details to find the right agency.' ) }
						/>

						<ToggleControl
							__nextHasNoMarginBottom
							label={ __( 'Accepting new clients' ) }
							checked={ formData.isAvailable }
							onChange={ ( isAvailable ) => setFormFields( { isAvailable } ) }
						/>

						<ToggleControl
							__nextHasNoMarginBottom
							label={ __( 'Accepting remote work from any location' ) }
							checked={ formData.isGlobal }
							onChange={ ( isGlobal ) => setFormFields( { isGlobal } ) }
						/>

						<VStack spacing={ 2 }>
							<TokenSelector
								label={ __( 'Industries' ) }
								options={ availableIndustries }
								value={ displayIndustries }
								onChange={ ( industries ) => {
									setFormFields( { industries } );
									updateValidationError( { industries: undefined } );
								} }
							/>
							{ validationError.industries && (
								<Text intent="error">{ validationError.industries }</Text>
							) }
						</VStack>

						<VStack spacing={ 2 }>
							<TokenSelector
								label={ __( 'Services you offer' ) }
								options={ availableServices }
								value={ formData.services }
								maxItems={ 5 }
								onChange={ ( services ) => {
									setFormFields( { services } );
									updateValidationError( { services: undefined } );
								} }
							/>
							{ validationError.services && (
								<Text intent="error">{ validationError.services }</Text>
							) }
						</VStack>

						<VStack spacing={ 2 }>
							<TokenSelector
								label={ __( 'Products you work with' ) }
								options={ availableProducts }
								value={ formData.products }
								onChange={ ( products ) => {
									setFormFields( { products } );
									updateValidationError( { products: undefined } );
								} }
							/>
							{ validationError.products && (
								<Text intent="error">{ validationError.products }</Text>
							) }
						</VStack>

						<VStack spacing={ 2 }>
							<TokenSelector
								label={ __( 'Languages spoken' ) }
								options={ availableLanguages }
								value={ formData.languagesSpoken }
								onChange={ ( languagesSpoken ) => {
									setFormFields( { languagesSpoken } );
									updateValidationError( { languages: undefined } );
								} }
							/>
							{ validationError.languages && (
								<Text intent="error">{ validationError.languages }</Text>
							) }
						</VStack>
					</VStack>
				</CardBody>
			</Card>

			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader
							level={ 3 }
							title={ __( 'Budget details' ) }
							description={ __(
								'Optionally set your minimum budget. Clients can filter these details to find the right agency.'
							) }
						/>

						<SelectControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ __( 'Minimum project budget' ) }
							value={ formData.budgetLowerRange }
							options={ budgetOptions }
							onChange={ ( budgetLowerRange ) => {
								setFormFields( { budgetLowerRange } );
								updateValidationError( { minimumBudget: undefined } );
							} }
							help={
								validationError.minimumBudget && (
									<Text intent="error">{ validationError.minimumBudget }</Text>
								)
							}
						/>
					</VStack>
				</CardBody>
			</Card>

			<ButtonStack justify="flex-start">
				<Button
					variant="primary"
					onClick={ submitForm }
					isBusy={ isSubmitting }
					disabled={ isSubmitting }
				>
					{ __( 'Save public profile' ) }
				</Button>
			</ButtonStack>
		</VStack>
	);
}
