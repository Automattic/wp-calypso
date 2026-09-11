import { formatCurrency } from '@automattic/number-formatters';
import {
	Button,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import { ButtonStack } from '../../../components/button-stack';
import { a4aLink } from '../../../utils/link';
import { useScheduleCall } from '../../tiers/use-schedule-call';
import { useMarketplaceType } from '../use-marketplace-type';
import { CheckGrid } from './content-sections';

export const PRESSABLE_PREMIUM_PLAN_COMMISSION_PERCENTAGE = 20;
const PRESSABLE_PREMIUM_PLAN_STARTING_PRICE = 350;

interface Props {
	agencyId?: number;
}

/** Shown on the Premium tab when there are no Premium plans to pick from. */
export default function PressablePremiumSection( { agencyId }: Props ) {
	const { recordTracksEvent } = useAnalytics();
	const { marketplaceType, updateMarketplaceType } = useMarketplaceType();
	const { scheduleCall, isLoading } = useScheduleCall( agencyId );
	const isReferralMode = marketplaceType === 'referral';

	const onReferNowClick = () => {
		recordTracksEvent( 'calypso_a4a_marketplace_hosting_pressable_premium_refer_now_click' );
		if ( ! isReferralMode ) {
			updateMarketplaceType( 'referral' );
		}
	};

	const onTalkToUsClick = () => {
		recordTracksEvent( 'calypso_a4a_marketplace_hosting_pressable_premium_talk_to_us_click' );
		scheduleCall();
	};

	return (
		<VStack spacing={ 5 }>
			<VStack spacing={ 3 }>
				<Heading level={ 3 } size={ 16 }>
					{ sprintf(
						/* translators: %d is the commission percentage. */
						__( 'Earn %d%% on Premium Plan Referrals' ),
						PRESSABLE_PREMIUM_PLAN_COMMISSION_PERCENTAGE
					) }
				</Heading>
				<Text variant="muted">
					{ __( 'For mission critical sites that demand extra attention and resources.' ) }
				</Text>
				<ButtonStack justify="flex-start" expanded={ false } wrap>
					{ /* TODO: The referral form is still the classic page. */ }
					<Button
						variant="primary"
						__next40pxDefaultSize
						href={
							isReferralMode
								? a4aLink( '/marketplace/hosting/refer-pressable-premium-plan' )
								: undefined
						}
						onClick={ onReferNowClick }
					>
						{ __( 'Refer now and get rewarded' ) }
					</Button>
					<Button
						variant="secondary"
						__next40pxDefaultSize
						isBusy={ isLoading }
						disabled={ isLoading }
						onClick={ onTalkToUsClick }
					>
						{ __( 'Buying for your agency? Talk to us ↗' ) }
					</Button>
				</ButtonStack>
			</VStack>
			<VStack spacing={ 3 }>
				<VStack spacing={ 1 }>
					<Heading level={ 3 } size={ 13 }>
						{ sprintf(
							/* translators: %1$s is the starting price, %2$d the commission percentage. */
							__( 'Premium plans from %1$s per month. Get %2$d%% commission when you refer.' ),
							formatCurrency( PRESSABLE_PREMIUM_PLAN_STARTING_PRICE, 'USD', { stripZeros: true } ),
							PRESSABLE_PREMIUM_PLAN_COMMISSION_PERCENTAGE
						) }
					</Heading>
					<Text variant="muted">{ __( 'per site, when billed monthly' ) }</Text>
				</VStack>
				<CheckGrid
					items={ [
						__( 'Support up to millions of visits per month' ),
						__( 'Starting at 10 base PHP Workers (5 vCPUs) per site' ),
						__( '512MB for each PHP worker/process' ),
						__( 'Vertical scaling with bursting to 100+ cores' ),
						__( 'Custom storage with add-on capabilities' ),
						__( 'Geo-redundant HA cloud' ),
						__( 'AMD EPYC Milan CPUs (64 core/128 thread)' ),
						__( 'Enterprise-level caching solutions' ),
						__( 'Smart plugin update schedules' ),
						__( 'Health & performance reports' ),
						__( 'Hourly & daily automated backups' ),
						__( 'Robust REST-based API, plus Git integration' ),
					] }
				/>
			</VStack>
		</VStack>
	);
}
