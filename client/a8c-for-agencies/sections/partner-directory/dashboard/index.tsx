import { BadgeType, Button } from '@automattic/components';
import { Icon, external, check } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import StepSection from '../../referrals/common/step-section';
import StepSectionItem from '../../referrals/common/step-section-item';
import StatusBadge from '../../referrals/common/step-section-item/status-badge';
import { getBrandMeta } from '../lib/get-brand-meta';

import './style.scss';

export default function PartnerDirectoryDashboard() {
	const translate = useTranslate();
	const dispatch = useDispatch();

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

	const isSubmitted = true; // FIXME: Replace with actual value
	const brandStatuses = [
		{
			brand: 'WordPress.com',
			status: 'Approved',
			type: 'success',
		},
		{
			brand: 'WooCommerce.com',
			status: 'Not approved',
			type: 'error',
		},
		{
			brand: 'Pressable.com',
			status: 'Pending',
			type: 'warning',
		},
		{
			brand: 'Jetpack.com',
			status: 'Pending',
			type: 'warning',
		},
	] as { brand: string; status: string; type: BadgeType }[]; // FIXME: Replace with actual value

	const isCompleted = true; // FIXME: Replace with actual value

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

	if ( isCompleted ) {
		return (
			<div className="partner-directory-dashboard__completed-section">
				<div className="partner-directory-dashboard__heading">
					{ translate( 'Congratulations! Your agency is now listed in our partner directories.' ) }
				</div>
				{ brandStatuses.length > 0 &&
					brandStatuses.map( ( { brand, status, type } ) => {
						const brandMeta = getBrandMeta( brand );
						return (
							<StepSectionItem
								isNewLayout
								iconClassName={ clsx( brandMeta.className ) }
								icon={ brandMeta.icon }
								heading={ brand }
								description={
									// FIXME: Add links to all the buttons
									status === 'Approved' ? (
										<>
											<Button className="a8c-blue-link" borderless href="#">
												{ translate( '%(brand)s Partner Directory', {
													args: { brand },
												} ) }
											</Button>
											<br />
											<Button
												className="a8c-blue-link"
												onClick={ onAgencyProfileClick }
												href="/partner-directory/agency-details"
												borderless
											>
												{ translate( `Your agency's profile` ) }
											</Button>
										</>
									) : (
										<StatusBadge
											statusProps={ {
												children: status,
												type,
											} }
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
							href="/partner-directory/agency-expertise"
							compact
						>
							{ translate( 'Edit expertise' ) }
						</Button>
						<Button onClick={ onEditProfileClick } href="/partner-directory/agency-details" compact>
							{ translate( 'Edit profile' ) }
						</Button>
					</div>
				</StepSection>
				{ programLinks }
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
						isSubmitted && brandStatuses.length > 0 ? (
							<div className="partner-directory-dashboard__brand-status-section">
								{ brandStatuses.map( ( { brand, status, type } ) => (
									<div key={ brand }>
										<StatusBadge
											statusProps={ {
												children: status,
												type,
											} }
										/>
										<span>{ brand }</span>
									</div>
								) ) }
							</div>
						) : (
							translate(
								`Pick your agency's specialties and choose your directories. We'll review your application.`
							)
						)
					}
					buttonProps={ {
						children: isSubmitted ? translate( 'Edit expertise' ) : translate( 'Apply now' ),
						href: '/partner-directory/agency-expertise',
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
						href: '/partner-directory/agency-details',
						onClick: onFinishProfileClick,
						primary: isSubmitted,
						disabled: ! isSubmitted,
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
			{ programLinks }
		</>
	);
}
