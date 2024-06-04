import { Button } from '@automattic/components';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import StepSection from '../../referrals/common/step-section';
import StepSectionItem from '../../referrals/common/step-section-item';

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
					stepNumber={ 1 }
					heading={ translate( 'Share your expertise' ) }
					description={ translate(
						`Pick your agency's specialties and choose your directories. We'll review your application.`
					) }
					buttonProps={ {
						children: translate( 'Apply now' ),
						href: '/partner-directory/agency-expertise',
						onClick: onApplyNowClick,
						primary: true,
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
						primary: false,
						disabled: true,
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
		</>
	);
}
