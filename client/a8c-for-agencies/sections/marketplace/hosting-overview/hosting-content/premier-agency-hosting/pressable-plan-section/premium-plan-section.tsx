import { isEnabled } from '@automattic/calypso-config';
import { formatCurrency } from '@automattic/number-formatters';
import { useBreakpoint } from '@automattic/viewport-react';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useContext } from 'react';
import {
	A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
	A4A_MARKETPLACE_HOSTING_REFER_PRESSABLE_PREMIUM_PLAN_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import SimpleList from 'calypso/a8c-for-agencies/components/simple-list';
import useScheduleCall from 'calypso/a8c-for-agencies/hooks/use-schedule-call';
import { MarketplaceTypeContext } from 'calypso/a8c-for-agencies/sections/marketplace/context';
import { PRESSABLE_PREMIUM_PLAN_COMMISSION_PERCENTAGE } from 'calypso/a8c-for-agencies/sections/marketplace/lib/constants';
import PressableLogo from 'calypso/assets/images/a8c-for-agencies/pressable-logo.svg';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import HostingPlanSection from '../../common/hosting-plan-section';

export default function PremiumPlanSection( {
	heading,
	banner,
}: {
	heading: string;
	banner: React.ReactNode;
} ) {
	const translate = useTranslate();
	const isPremiumPlansEnabled = isEnabled( 'a4a-pressable-premium-plans' );

	const { marketplaceType, toggleMarketplaceType } = useContext( MarketplaceTypeContext );

	const dispatch = useDispatch();

	const isDesktop = useBreakpoint( '>1280px' );

	const { scheduleCall, isLoading } = useScheduleCall();

	const onReferNowClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_marketplace_hosting_pressable_premium_refer_now_click' )
		);
		if ( isPremiumPlansEnabled && marketplaceType !== 'referral' ) {
			toggleMarketplaceType();
		}
	};

	const onTalkToUsClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_marketplace_hosting_pressable_premium_talk_to_us_click' )
		);
		scheduleCall();
	};

	// Show refer button if premium plans are not enabled or if they are enabled and we are not in referral mode
	const shouldShowReferButton = ! isPremiumPlansEnabled || marketplaceType !== 'referral';

	return (
		<HostingPlanSection className="pressable-plan-section" heading={ heading }>
			{ banner }
			<HostingPlanSection.Card>
				<img className="premium-plan-section__logo" src={ PressableLogo } alt="Pressable" />

				<div className="premium-plan-section__content">
					<div className="premium-plan-section__heading">
						{ translate( 'Earn %(commission)s%% on Premium Plan Referrals', {
							args: {
								commission: PRESSABLE_PREMIUM_PLAN_COMMISSION_PERCENTAGE,
							},
						} ) }
					</div>
					<div className="premium-plan-section__subheading">
						{ translate( 'For mission critical sites that demand extra attention and resources.' ) }
					</div>

					<div className="premium-plan-section__cta-buttons">
						{ shouldShowReferButton && (
							<Button
								href={
									isPremiumPlansEnabled
										? A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK
										: A4A_MARKETPLACE_HOSTING_REFER_PRESSABLE_PREMIUM_PLAN_LINK
								}
								onClick={ onReferNowClick }
								variant="primary"
								__next40pxDefaultSize
							>
								{ translate( 'Refer now and get rewarded' ) }
							</Button>
						) }

						<Button
							className="premium-plan-section__cta-button"
							onClick={ onTalkToUsClick }
							variant="secondary"
							iconSize={ 16 }
							__next40pxDefaultSize
							isBusy={ isLoading }
							disabled={ isLoading }
						>
							{ isDesktop
								? translate( 'Buying for your agency? Talk to us ↗' )
								: translate( 'For your agency? Talk to us ↗' ) }
						</Button>
					</div>
				</div>
			</HostingPlanSection.Card>
			<HostingPlanSection.Details
				heading={ translate(
					'Premium plans from %(price)s per month. Get %(commission)s%% commission when you refer.',
					{
						args: {
							price: formatCurrency( 350, 'USD', {
								stripZeros: true,
							} ),
							commission: PRESSABLE_PREMIUM_PLAN_COMMISSION_PERCENTAGE,
						},
					}
				) }
				subheading={ translate( 'per site, when billed monthly' ) }
			>
				<SimpleList
					className="premium-plan-section__two-columns-list"
					items={ [
						translate( 'Support up to millions of visits per month' ),
						translate( 'Starting at 10 base PHP Workers (5 vCPUs) per site' ),
						translate( '512MB for each PHP worker/process' ),
						translate( 'Vertical scaling with bursting to 100+ cores' ),
						translate( 'Custom storage with add-on capabilities' ),
						translate( 'Geo-redundant HA cloud' ),
						translate( 'AMD EPYC Milan CPUs (64 core/128 thread)' ),
						translate( 'Enterprise-level caching solutions' ),
						translate( 'Smart plugin update schedules' ),
						translate( 'Health & performance reports' ),
						translate( 'Hourly & daily automated backups' ),
						translate( 'Robust REST-based API, plus Git integration' ),
					] }
				/>
			</HostingPlanSection.Details>
		</HostingPlanSection>
	);
}
