import { formatCurrency } from '@automattic/number-formatters';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { A4A_MARKETPLACE_HOSTING_REFER_PRESSABLE_PREMIUM_PLAN_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import SimpleList from 'calypso/a8c-for-agencies/components/simple-list';
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
	const dispatch = useDispatch();

	const onReferNowClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_marketplace_hosting_pressable_premium_refer_now_click' )
		);
	};

	const onTalkToUsClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_marketplace_hosting_pressable_premium_talk_to_us_click' )
		);
	};

	return (
		<HostingPlanSection className="pressable-plan-section" heading={ heading }>
			{ banner }
			<HostingPlanSection.Card>
				<img className="premium-plan-section__logo" src={ PressableLogo } alt="Pressable" />

				<div className="premium-plan-section__content">
					<div className="premium-plan-section__heading">
						{ translate( 'Earn 20% on Premium Plan Referrals' ) }
					</div>
					<div className="premium-plan-section__subheading">
						{ translate( 'For mission critical sites that demand extra attention and resources.' ) }
					</div>

					<div className="premium-plan-section__cta-buttons">
						<Button
							className="premium-plan-section__cta-button"
							href={ A4A_MARKETPLACE_HOSTING_REFER_PRESSABLE_PREMIUM_PLAN_LINK }
							onClick={ onReferNowClick }
							variant="primary"
							__next40pxDefaultSize
						>
							{ translate( 'Refer now and get rewarded' ) }
						</Button>

						<Button
							className="premium-plan-section__cta-button"
							href="https://wpvip.com/get-a-demo/?utm_source=partner&utm_medium=referral&utm_campaign=a4a"
							onClick={ onTalkToUsClick }
							target="_blank"
							variant="secondary"
							iconPosition="right"
							iconSize={ 16 }
							__next40pxDefaultSize
						>
							{ translate( 'Buying for your agency? Talk to us' ) }
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
							commission: '20',
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
