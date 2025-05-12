import { BadgeType } from '@automattic/components';
import { Button, ExternalLink } from '@wordpress/components';
import { check } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { A4A_PARTNER_DIRECTORY_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import StepSection from 'calypso/a8c-for-agencies/components/step-section';
import StepSectionItem from 'calypso/a8c-for-agencies/components/step-section-item';
import { useDispatch, useSelector } from 'calypso/state';
import { setActiveAgency } from 'calypso/state/a8c-for-agencies/agency/actions';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { Agency } from 'calypso/state/a8c-for-agencies/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice } from 'calypso/state/notices/actions';
import useDetailsForm from '../agency-details/hooks/use-details-form';
import useSubmitExpertiseForm from '../agency-expertise/hooks/use-submit-form';
import { useFormSelectors } from '../components/hooks/use-form-selectors';
import {
	PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG,
	PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG,
} from '../constants';
import { getBrandMeta, BrandMeta } from '../lib/get-brand-meta';
import { AgencyDirectoryApplication } from '../types';
import {
	mapAgencyDetailsFormData,
	mapApplicationFormData,
} from '../utils/map-application-form-data';
import DashboardStatusBadge from './status-badge';

import './style.scss';

interface DirectoryApplicationStatus {
	key: string;
	brand: string;
	status: string;
	type: BadgeType;
}

interface StatusBadge {
	key: string;
	label: string;
	type: BadgeType;
}

const PartnerDirectoryDashboard = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const agency = useSelector( getActiveAgency );

	const [ applicationData, setApplicationData ] = useState< AgencyDirectoryApplication | null >(
		null
	);

	useEffect( () => {
		if ( agency ) {
			setApplicationData( mapApplicationFormData( agency ) );
		}
	}, [ agency ] );

	const applicationWasSubmitted = applicationData ? applicationData.status !== 'completed' : false;

	const agencyDetailsData = useMemo( () => mapAgencyDetailsFormData( agency ), [ agency ] );

	const applicationStatusTypeMap = useMemo( (): Record< string, StatusBadge > => {
		return {
			pending: {
				key: 'pending',
				label: translate( 'Pending' ),
				type: 'warning',
			},
			approved: {
				key: 'approved',
				label: translate( 'Approved' ),
				type: 'success',
			},
			rejected: {
				key: 'rejected',
				label: translate( 'Not approved' ),
				type: 'error',
			},
			closed: {
				key: 'closed',
				label: translate( 'Closed' ),
				type: 'info',
			},
			unknown: {
				key: 'unknown',
				label: '-',
				type: 'info',
			},
		};
	}, [ translate ] );

	const [ shouldSubmitPublishProfile, setShouldSubmitPublishProfile ] = useState( false );

	const onSubmitPublishProfileSuccess = useCallback(
		( response: Agency ) => {
			// Update the store with the new agency data
			if ( response ) {
				dispatch( setActiveAgency( { ...agency, ...response } ) );
			}

			dispatch( successNotice( translate( 'Your profile has been saved!' ), { duration: 6000 } ) );
		},
		[ agency, translate, dispatch ]
	);

	const { onSubmit: submitPublishProfile, isSubmitting: isSubmittingPublishProfile } =
		useSubmitExpertiseForm( {
			formData: applicationData,
			onSubmitSuccess: onSubmitPublishProfileSuccess,
		} );

	const onApplyNowClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_partner_directory_dashboard_apply_now_click' ) );
	}, [ dispatch ] );

	const onFinishProfileClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_partner_directory_dashboard_finish_profile_click' ) );
	}, [ dispatch ] );

	const onPublishProfileClick = useCallback( () => {
		setApplicationData( ( state ) => {
			if ( state === null ) {
				return state;
			}
			const newState = {
				...state,
				isPublished: true,
			};

			return newState;
		} );

		setShouldSubmitPublishProfile( true );

		dispatch( recordTracksEvent( 'calypso_partner_directory_dashboard_publish_profile_click' ) );
	}, [ dispatch, setApplicationData ] );

	const onEditExpertiseClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_partner_directory_dashboard_edit_expertise_click' ) );
	}, [ dispatch ] );

	const onEditProfileClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_partner_directory_dashboard_edit_profile_click' ) );
	}, [ dispatch ] );

	// We want to scroll to the top of the page when the component is rendered
	useEffect( () => {
		document.querySelector( '.partner-directory__body' )?.scrollTo( 0, 0 );
	}, [] );

	useEffect( () => {
		if ( shouldSubmitPublishProfile ) {
			submitPublishProfile();
			setShouldSubmitPublishProfile( false );
		}
	}, [ shouldSubmitPublishProfile, submitPublishProfile ] );

	const { isValidFormData } = useDetailsForm( { initialFormData: agencyDetailsData } );

	const isCompleted =
		( applicationData?.isPublished &&
			applicationData.directories?.some(
				( directory ) => directory.status === 'approved' && directory.isPublished
			) ) ??
		false;

	const { availableDirectories } = useFormSelectors();

	const directoryApplicationStatuses: DirectoryApplicationStatus[] =
		applicationData?.directories?.reduce( ( statuses: DirectoryApplicationStatus[], directory ) => {
			statuses.push( {
				brand: availableDirectories[ directory.directory ],
				status: applicationStatusTypeMap[ directory.status || 'unknown' ].label,
				type: applicationStatusTypeMap[ directory.status || 'unknown' ].type,
				key: applicationStatusTypeMap[ directory.status || 'unknown' ].key,
			} );
			return statuses;
		}, [] ) || [];

	const hasDirectoryApproval = directoryApplicationStatuses.some(
		( { key } ) => key === 'approved'
	);

	const currentApplicationStep = useMemo( () => {
		// Step 3: The application should be finished, not pending directory application.
		if ( isCompleted ) {
			return 3;
		}

		// Step 2: One application should be approved and the form should be valid
		if ( hasDirectoryApproval && isValidFormData ) {
			return 2;
		}

		// Step 1: The application should be submitted
		if ( applicationWasSubmitted ) {
			return 1;
		}
		// Initial application status: no application has been submitted
		return 0;
	}, [ isCompleted, hasDirectoryApproval, isValidFormData, applicationWasSubmitted ] );

	// todo: to remove this when we the KB links are published.
	const displayProgramLinks = true;

	const programLinks = (
		<StepSection
			className="partner-directory-dashboard__learn-more-section"
			heading={ translate( 'Learn more about the program' ) }
		>
			<ExternalLink href="https://agencieshelp.automattic.com/knowledge-base/agency-directory-listings">
				{ translate( 'How does the approval process work?' ) }
			</ExternalLink>
			<br />
			<ExternalLink href="https://agencieshelp.automattic.com/knowledge-base/agency-directory-listings/#profile-content">
				{ translate( 'What can I put on my public profile?' ) }
			</ExternalLink>
		</StepSection>
	);

	// The Agency application is completed: At least a directory was approved and published
	if ( isCompleted ) {
		const getDirectoryDescription = (
			brandMeta: BrandMeta,
			application: DirectoryApplicationStatus
		) => {
			const showPopoverOnLoad =
				directoryApplicationStatuses.filter( ( { key } ) => key === 'rejected' ).length === 1;

			if ( application.key === 'approved' && brandMeta.isAvailable ) {
				// Application approved and visible in the directory
				return (
					<>
						<ExternalLink href={ brandMeta.url }>
							{ translate( '%(brand)s Partner Directory', {
								args: { brand: brandMeta.brand },
							} ) }
						</ExternalLink>
						<br />
						<ExternalLink href={ brandMeta.urlProfile }>
							{ translate( "Your agency's profile" ) }
						</ExternalLink>
					</>
				);
			}
			// Application pending or rejected
			return (
				<>
					<DashboardStatusBadge
						statusProps={ {
							status: application.status,
							type: application.type,
						} }
						showPopoverOnLoad={ showPopoverOnLoad }
					/>
					<div>
						{
							// Application approved, but the Directory page is not available yet
							application.key === 'approved' && ! brandMeta.isAvailable
								? translate( 'This partner directory is launching soon.' )
								: ''
						}
					</div>
				</>
			);
		};

		return (
			<div className="partner-directory-dashboard__completed-section">
				<div className="partner-directory-dashboard__heading">
					{ translate(
						'Congratulations! Your agency is now listed in our partner directory.',
						'Congratulations! Your agency is now listed in our partner directories.',
						{
							count: directoryApplicationStatuses.filter( ( { key } ) => key === 'approved' )
								.length,
						}
					) }
				</div>
				{ directoryApplicationStatuses.length > 0 &&
					directoryApplicationStatuses.map( ( application: DirectoryApplicationStatus ) => {
						const brandMeta = getBrandMeta( application.brand, agency );

						return (
							<StepSectionItem
								key={ application.brand }
								iconClassName={ clsx( brandMeta.className ) }
								icon={ brandMeta.icon }
								heading={ application.brand }
								description={ getDirectoryDescription( brandMeta, application ) }
							/>
						);
					} ) }
				<StepSection
					className="partner-directory-dashboard__edit-section"
					heading={ translate( "Edit your agency's information" ) }
				>
					<div className="partner-directory-dashboard__subtitle">
						{ translate(
							"Expand to more Automattic directories by adding products or updating your agency's profile."
						) }
					</div>
					<div className="partner-directory-dashboard__button-container">
						<Button
							onClick={ onEditExpertiseClick }
							href={ `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG }` }
							variant="secondary"
						>
							{ translate( 'Edit expertise' ) }
						</Button>
						<Button
							onClick={ onEditProfileClick }
							href={ `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG }` }
							variant="secondary"
						>
							{ translate( 'Edit profile' ) }
						</Button>
					</div>
				</StepSection>
				{ displayProgramLinks && programLinks }
			</div>
		);
	}

	return (
		<>
			<div className="partner-directory-dashboard__heading">
				{ translate( 'Boost your agency’s visibility across Automattic listings.' ) }
			</div>

			<div className="partner-directory-dashboard__subtitle">
				{ translate(
					'List your agency in our partner directories. Showcase your skills, attract clients, and grow your business.'
				) }
			</div>
			<StepSection heading={ translate( 'How do I start?' ) }>
				<StepSectionItem
					className={
						currentApplicationStep > 0 ? 'partner-directory-dashboard__checked-step' : ''
					}
					stepNumber={ currentApplicationStep > 0 ? undefined : 1 }
					icon={ currentApplicationStep > 0 ? check : undefined }
					heading={ translate( 'Share your expertise' ) }
					description={
						applicationWasSubmitted && directoryApplicationStatuses.length > 0 ? (
							<div className="partner-directory-dashboard__brand-status-section">
								{ directoryApplicationStatuses.map( ( { brand, status, type } ) => {
									const showPopoverOnLoad =
										directoryApplicationStatuses.filter( ( { key } ) => key === 'rejected' )
											.length === 1;
									return (
										<div key={ brand }>
											<DashboardStatusBadge
												statusProps={ {
													status,
													type,
												} }
												showPopoverOnLoad={ showPopoverOnLoad }
											/>
											<span>{ brand }</span>
										</div>
									);
								} ) }
							</div>
						) : (
							translate(
								"Pick your agency's specialties and choose your directories. We'll review your application."
							)
						)
					}
					buttonProps={ {
						children: applicationWasSubmitted
							? translate( 'Edit expertise' )
							: translate( 'Apply now' ),
						href: `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG }`,
						onClick: onApplyNowClick,
						primary: ! applicationWasSubmitted,
						compact: true,
					} }
				/>
				<StepSectionItem
					className={
						currentApplicationStep > 1 ? 'partner-directory-dashboard__checked-step' : ''
					}
					stepNumber={ currentApplicationStep > 1 ? undefined : 2 }
					icon={ currentApplicationStep > 1 ? check : undefined }
					heading={ translate( 'Finish adding details to your public profile' ) }
					description={ translate(
						"When approved, add details to your agency's public profile for clients to see."
					) }
					buttonProps={ {
						children: isValidFormData ? translate( 'Edit profile' ) : translate( 'Finish profile' ),
						href: `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG }`,
						onClick: onFinishProfileClick,
						primary: applicationWasSubmitted && hasDirectoryApproval && ! isValidFormData,
						disabled: ! applicationWasSubmitted || ! hasDirectoryApproval,
						compact: true,
					} }
				/>
				<StepSectionItem
					stepNumber={ currentApplicationStep > 2 ? undefined : 3 }
					icon={ currentApplicationStep > 2 ? check : undefined }
					heading={ translate( 'New clients will find you' ) }
					description={
						<>
							{ translate(
								'Your agency will appear in the partner directories you select and get approved for, including WordPress.com, Woo.com, Pressable.com, and Jetpack.com.'
							) }
							<br />
							{ translate( 'These partner directories are launching soon.' ) }
						</>
					}
					buttonProps={ {
						children: translate( 'Done' ),
						onClick: onPublishProfileClick,
						primary: applicationWasSubmitted,
						disabled:
							! applicationWasSubmitted ||
							! hasDirectoryApproval ||
							! isValidFormData ||
							isSubmittingPublishProfile,
						compact: true,
					} }
				/>
			</StepSection>
			{ displayProgramLinks && programLinks }
		</>
	);
};

export default PartnerDirectoryDashboard;
