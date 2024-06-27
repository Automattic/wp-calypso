import { BadgeType, Button } from '@automattic/components';
import { Icon, external, check } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo } from 'react';
import { A4A_PARTNER_DIRECTORY_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useDetailsForm from 'calypso/a8c-for-agencies/sections/partner-directory/agency-details/hooks/use-details-form';
import { useFormSelectors } from 'calypso/a8c-for-agencies/sections/partner-directory/components/hooks/use-form-selectors';
import {
	PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG,
	PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG,
} from 'calypso/a8c-for-agencies/sections/partner-directory/constants';
import {
	mapAgencyDetailsFormData,
	mapApplicationFormData,
} from 'calypso/a8c-for-agencies/sections/partner-directory/utils/map-application-form-data';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import StepSection from '../../referrals/common/step-section';
import StepSectionItem from '../../referrals/common/step-section-item';
import { getBrandMeta } from '../lib/get-brand-meta';
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

	const applicationData = useMemo( () => mapApplicationFormData( agency ), [ agency ] );
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

	const onApplyNowClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_partner_directory_dashboard_apply_now_click' ) );
	}, [ dispatch ] );

	const onFinishProfileClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_partner_directory_dashboard_finish_profile_click' ) );
	}, [ dispatch ] );

	const onEditExpertiseClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_partner_directory_dashboard_edit_expertise_click' ) );
	}, [ dispatch ] );

	const onEditProfileClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_partner_directory_dashboard_edit_profile_click' ) );
	}, [ dispatch ] );

	const onAgencyProfileClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_partner_directory_dashboard_agency_profile_click' ) );
	}, [ dispatch ] );

	// We want to scroll to the top of the page when the component is rendered
	useEffect( () => {
		document.querySelector( '.partner-directory__body' )?.scrollTo( 0, 0 );
	}, [] );

	const isSubmitted = applicationData?.status !== 'completed';

	const { isValidFormData } = useDetailsForm( { initialFormData: agencyDetailsData } );

	const isCompleted =
		( applicationData?.directories?.every( ( directory ) => directory.status !== 'pending' ) &&
			isValidFormData ) ??
		false;

	const { availableDirectories } = useFormSelectors();

	const directoryApplicationStatuses =
		applicationData?.directories?.reduce( ( statuses: DirectoryApplicationStatus[], directory ) => {
			statuses.push( {
				brand: availableDirectories[ directory.directory ],
				status: applicationStatusTypeMap[ directory.status || 'unknown' ].label,
				type: applicationStatusTypeMap[ directory.status || 'unknown' ].type,
				key: applicationStatusTypeMap[ directory.status || 'unknown' ].key,
			} );
			return statuses;
		}, [] ) || [];

	// todo: to remove this when we have the links.
	const displayProgramLinks = false;

	const programLinks = (
		<StepSection
			className="partner-directory-dashboard__learn-more-section"
			heading={ translate( 'Learn more about the program' ) }
		>
			{
				// FIXME: Add link
				<Button className="a8c-blue-link" borderless href="#">
					{ translate( 'How does the approval process work?' ) }
					<Icon icon={ external } size={ 18 } />
				</Button>
			}
			<br />
			{
				// FIXME: Add link
				<Button className="a8c-blue-link" borderless href="#">
					{ translate( 'What can I put on my public profile?' ) }
					<Icon icon={ external } size={ 18 } />
				</Button>
			}
		</StepSection>
	);

	const showFinishProfileButton = directoryApplicationStatuses.some(
		( { key } ) => key === 'approved'
	);

	if ( isCompleted ) {
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
					directoryApplicationStatuses.map( ( { brand, status, type, key } ) => {
						const brandMeta = getBrandMeta( brand );
						const showPopoverOnLoad =
							directoryApplicationStatuses.filter( ( { key } ) => key === 'rejected' ).length === 1;
						return (
							<StepSectionItem
								isNewLayout
								iconClassName={ clsx( brandMeta.className ) }
								icon={ brandMeta.icon }
								heading={ brand }
								description={
									// FIXME: Add links to all the buttons
									key === 'approved' ? (
										<>
											<Button className="a8c-blue-link" borderless href={ brandMeta.url }>
												{ translate( '%(brand)s Partner Directory', {
													args: { brand },
												} ) }
											</Button>
											<br />
											<Button
												className="a8c-blue-link"
												onClick={ onAgencyProfileClick }
												href={ `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG }` }
												borderless
											>
												{ translate( `Your agency's profile` ) }
											</Button>
										</>
									) : (
										<DashboardStatusBadge
											statusProps={ {
												status,
												type,
											} }
											showPopoverOnLoad={ showPopoverOnLoad }
										/>
									)
								}
							/>
						);
					} ) }
				<StepSection
					className="partner-directory-dashboard__edit-section"
					heading={ translate( `Edit your agency's information` ) }
				>
					<div className="partner-directory-dashboard__subtitle">
						{ translate(
							`Expand to more Automattic directories by adding products or updating your agency's profile.`
						) }
					</div>
					<div>
						<Button
							onClick={ onEditExpertiseClick }
							href={ `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG }` }
							compact
						>
							{ translate( 'Edit expertise' ) }
						</Button>
						<Button
							onClick={ onEditProfileClick }
							href={ `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG }` }
							compact
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
				{ translate( `Boost your agency's visibility across Automattic platforms.` ) }
			</div>

			<div className="partner-directory-dashboard__subtitle">
				{ translate(
					'List your agency in our partner directories. Showcase your skills, attract clients, and grow your business.'
				) }
			</div>
			<StepSection heading={ translate( 'How do I start?' ) }>
				<StepSectionItem
					isNewLayout
					className="partner-directory-dashboard__apply-now-section"
					icon={ check }
					stepNumber={ isSubmitted ? undefined : 1 }
					heading={ translate( 'Share your expertise' ) }
					description={
						isSubmitted && directoryApplicationStatuses.length > 0 ? (
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
								`Pick your agency's specialties and choose your directories. We'll review your application.`
							)
						)
					}
					buttonProps={ {
						children: isSubmitted ? translate( 'Edit expertise' ) : translate( 'Apply now' ),
						href: `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG }`,
						onClick: onApplyNowClick,
						primary: ! isSubmitted,
						compact: true,
					} }
				/>
				<StepSectionItem
					isNewLayout
					stepNumber={ 2 }
					heading={ translate( 'Finish adding details to your public profile' ) }
					description={ translate(
						`When approved, add details to your agency's public profile for clients to see.`
					) }
					buttonProps={ {
						children: translate( 'Finish profile' ),
						href: `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG }`,
						onClick: onFinishProfileClick,
						primary: isSubmitted,
						disabled: ! isSubmitted || ! showFinishProfileButton,
						compact: true,
					} }
				/>
				<StepSectionItem
					isNewLayout
					stepNumber={ 3 }
					heading={ translate( 'New clients will find you' ) }
					description={ translate(
						'Your agency will appear in the partner directories you select and get approved for, including WordPress.com, Woo.com, Pressable.com, and Jetpack.com.'
					) }
				/>
			</StepSection>
			{ displayProgramLinks && programLinks }
		</>
	);
};

export default PartnerDirectoryDashboard;
