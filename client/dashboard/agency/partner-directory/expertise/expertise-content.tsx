import { agencyPartnerDirectoryApplicationMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Button,
	CheckboxControl,
	TextControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import { useRef } from 'react';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import { ButtonStack } from '../../../components/button-stack';
import { Card, CardBody } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import { Text } from '../../../components/text';
import { DIRECTORY_NAMES } from '../lib';
import LinkButton from '../link-button';
import { getAvailableProducts, getAvailableServices, SELECTABLE_DIRECTORIES } from './options';
import TokenSelector from './token-selector';
import useExpertiseForm, { getExpertiseFormData } from './use-expertise-form';
import useExpertiseFormValidation from './use-expertise-form-validation';
import type { Agency, AgencyProfile } from '@automattic/api-core';

import './style.scss';

/**
 * The minimal agency shape the expertise form needs. Kept structural so both
 * the dashboard (`@automattic/api-core` agency) and the A4A client (Redux
 * agency) can provide it.
 */
interface PartnerDirectoryExpertiseAgency {
	id: number;
	profile?: AgencyProfile | null;
}

interface Props {
	agency: PartnerDirectoryExpertiseAgency;
	recordTracksEvent: ( eventName: string, properties?: Record< string, unknown > ) => void;
	/** Where the Cancel button and the not-submitted state lead back to. */
	dashboardUrl: string;
	onSubmitSuccess?: ( agency: Agency ) => void;
	onSubmitError?: () => void;
	shouldUseRouterLink?: boolean;
}

/*
 * Shared by the dashboard snackbar and the classic app's notices so the two
 * hosts can't drift apart.
 */
export const getApplicationSubmittedMessage = () => __( 'Application submitted.' );
export const getApplicationSubmitFailedMessage = () => __( 'Failed to submit your application.' );

export default function PartnerDirectoryExpertiseContent( {
	agency,
	recordTracksEvent,
	dashboardUrl,
	onSubmitSuccess,
	onSubmitError,
	shouldUseRouterLink,
}: Props ) {
	const initialFormData = getExpertiseFormData( agency.profile );
	const hasApplication = initialFormData !== null;

	const {
		formData,
		setFormData,
		isDirectorySelected,
		isDirectoryApproved,
		setDirectorySelected,
		getDirectoryClientSamples,
		setDirectoryClientSamples,
	} = useExpertiseForm( { initialFormData } );
	const { validate, validationError, updateValidationError } = useExpertiseFormValidation();

	const { mutate: submitApplication, isPending: isSubmitting } = useMutation(
		withSnackbar( agencyPartnerDirectoryApplicationMutation( agency.id ), {
			success: getApplicationSubmittedMessage(),
			error: getApplicationSubmitFailedMessage(),
		} )
	);

	const contentRef = useRef< HTMLDivElement >( null );

	const availableServices = getAvailableServices();
	const availableProducts = getAvailableProducts();

	const submitForm = () => {
		recordTracksEvent( 'calypso_a4a_partner_directory_expertise_submit_click', {
			is_update: hasApplication,
		} );

		const error = validate( formData );
		if ( error ) {
			// The services and products fields sit above the fold; bring them
			// back into view so their errors aren't missed.
			if ( error.services || error.products ) {
				contentRef.current?.scrollIntoView( { behavior: 'smooth' } );
			}
			return;
		}

		submitApplication(
			{
				services: formData.services,
				products: formData.products,
				directories: formData.directories.map( ( { directory, urls, note } ) => ( {
					directory,
					urls,
					note,
				} ) ),
				feedback_url: formData.feedbackUrl,
				is_published: formData.isPublished,
			},
			{
				onSuccess: ( updatedAgency ) => onSubmitSuccess?.( updatedAgency ),
				onError: () => onSubmitError?.(),
			}
		);
	};

	const pendingDirectories = formData.directories.filter( ( { status } ) => status !== 'approved' );

	return (
		<VStack ref={ contentRef } spacing={ 8 }>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader level={ 3 } title={ __( 'Product and service' ) } />

						<VStack spacing={ 2 }>
							<TokenSelector
								label={ __( 'What services do you offer?' ) }
								options={ availableServices }
								value={ formData.services }
								maxItems={ 5 }
								onChange={ ( services ) => {
									setFormData( ( state ) => ( { ...state, services } ) );
									updateValidationError( { services: undefined } );
								} }
							/>
							{ validationError.services && (
								<Text intent="error">{ validationError.services }</Text>
							) }
							<Text variant="muted">
								{ __(
									'We allow each agency to offer up to five services to help you focus on what you do best.'
								) }
							</Text>
						</VStack>

						<VStack spacing={ 2 }>
							<TokenSelector
								label={ __( 'What products do you work with?' ) }
								options={ availableProducts }
								value={ formData.products }
								onChange={ ( products ) => {
									setFormData( ( state ) => ( { ...state, products } ) );
									updateValidationError( { products: undefined } );
								} }
							/>
							{ validationError.products && (
								<Text intent="error">{ validationError.products }</Text>
							) }
						</VStack>
					</VStack>
				</CardBody>
			</Card>

			<Card>
				<CardBody>
					<VStack spacing={ 6 }>
						<SectionHeader level={ 3 } title={ __( 'Partner Directories' ) } />

						<VStack spacing={ 3 }>
							<VStack spacing={ 1 }>
								<Text weight={ 500 }>{ __( 'Automattic Partner Directories' ) }</Text>
								<Text variant="muted">
									{ __( 'Select the Automattic directories you would like to appear on.' ) }
								</Text>
							</VStack>
							<VStack spacing={ 2 }>
								{ SELECTABLE_DIRECTORIES.map( ( directory ) => (
									<CheckboxControl
										key={ directory }
										__nextHasNoMarginBottom
										label={ DIRECTORY_NAMES[ directory ] }
										checked={ isDirectorySelected( directory ) }
										disabled={ isDirectoryApproved( directory ) }
										onChange={ ( checked ) => {
											setDirectorySelected( directory, checked );
											updateValidationError( { directories: undefined, clientSites: undefined } );
										} }
									/>
								) ) }
							</VStack>
							{ validationError.directories && (
								<Text intent="error">{ validationError.directories }</Text>
							) }
						</VStack>

						{ pendingDirectories.length > 0 && (
							<VStack spacing={ 4 }>
								<VStack spacing={ 1 }>
									<Text weight={ 500 }>{ __( 'Client sites' ) }</Text>
									<Text variant="muted">
										{ __(
											'For each directory you selected, provide URLs of 5 client sites you’ve worked on. This helps us gauge your expertise.'
										) }
									</Text>
								</VStack>
								<div className="partner-directory-expertise__client-sites">
									{ pendingDirectories.map( ( { directory } ) => {
										const samples = getDirectoryClientSamples( directory );

										return (
											<VStack spacing={ 2 } key={ directory }>
												<Text weight={ 500 }>
													{ sprintf(
														/* translators: %s is the directory name, e.g. "WordPress.com" */
														__( 'Relevant examples for %s' ),
														DIRECTORY_NAMES[ directory ]
													) }
												</Text>
												{ samples.map( ( sample, index ) => (
													<TextControl
														key={ `${ directory }-sample-${ index }` }
														__next40pxDefaultSize
														__nextHasNoMarginBottom
														type="text"
														placeholder={ __( 'Enter URL' ) }
														aria-label={ sprintf(
															/* translators: %1$d is a number from 1 to 5, %2$s is the directory name, e.g. "WordPress.com" */
															__( 'Client site %1$d for %2$s' ),
															index + 1,
															DIRECTORY_NAMES[ directory ]
														) }
														value={ sample }
														onChange={ ( value ) => {
															setDirectoryClientSamples(
																directory,
																samples.map( ( url, i ) => ( i === index ? value : url ) )
															);
															updateValidationError( { clientSites: undefined } );
														} }
													/>
												) ) }
											</VStack>
										);
									} ) }
								</div>
								{ validationError.clientSites && (
									<Text intent="error">{ validationError.clientSites }</Text>
								) }
							</VStack>
						) }

						<VStack spacing={ 2 }>
							<TextControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								type="text"
								label={ __( 'Share customer feedback' ) }
								placeholder={ __( 'Enter URL' ) }
								value={ formData.feedbackUrl }
								onChange={ ( feedbackUrl ) => {
									setFormData( ( state ) => ( { ...state, feedbackUrl } ) );
									updateValidationError( { feedbackUrl: undefined } );
								} }
							/>
							{ validationError.feedbackUrl && (
								<Text intent="error">{ validationError.feedbackUrl }</Text>
							) }
							<Text variant="muted">
								{ __(
									'Share a link to your customer feedback from Google, Clutch, Facebook, etc., or testimonials featured on your website. If you don’t have online reviews, provide a link to client references or case studies.'
								) }
							</Text>
						</VStack>
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
					{ hasApplication ? __( 'Update my expertise' ) : __( 'Submit my application' ) }
				</Button>
				<LinkButton
					href={ dashboardUrl }
					variant="tertiary"
					disabled={ isSubmitting }
					shouldUseRouterLink={ shouldUseRouterLink }
				>
					{ __( 'Cancel' ) }
				</LinkButton>
			</ButtonStack>
		</VStack>
	);
}
