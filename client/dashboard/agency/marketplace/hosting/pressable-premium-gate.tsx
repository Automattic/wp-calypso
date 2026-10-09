import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	Button,
	ToggleControl,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import { Card, CardBody, CardDivider, CardHeader } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import { useScheduleCall } from '../../tiers/use-schedule-call';
import { useReferralToggle } from '../use-referral-toggle';

const PRESSABLE_PREMIUM_PLAN_COMMISSION_PERCENTAGE = 20;

interface Props {
	/** The selected plan, e.g. "Pressable Premium 3". */
	label: string;
}

/** The purchase rail on the Premium tab with referrals off: Premium plans are only sold through referrals. */
export default function PressablePremiumGate( { label }: Props ) {
	const { recordTracksEvent } = useAnalytics();
	const { checked, disabled, onChange } = useReferralToggle();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { scheduleCall, isLoading } = useScheduleCall( agency?.id );

	const onReferToggle = ( value: boolean ) => {
		recordTracksEvent( 'calypso_a4a_marketplace_hosting_pressable_premium_refer_now_click' );
		onChange( value );
	};

	const onTalkToUsClick = () => {
		recordTracksEvent( 'calypso_a4a_marketplace_hosting_pressable_premium_talk_to_us_click' );
		scheduleCall();
	};

	return (
		<Card>
			<CardHeader>
				<SectionHeader level={ 3 } title={ __( 'Currently selected' ) } />
			</CardHeader>
			<CardBody>
				<VStack spacing={ 4 } alignment="stretch">
					<VStack spacing={ 2 }>
						<Text>{ label }</Text>
						<Text variant="muted">
							{ sprintf(
								/* translators: %d is the commission percentage. */
								__(
									'Premium plans are sold through referrals. Turn on Refer hosting to refer this plan to a client and earn %d%% commission on every payment.'
								),
								PRESSABLE_PREMIUM_PLAN_COMMISSION_PERCENTAGE
							) }
						</Text>
					</VStack>
					<ToggleControl
						__nextHasNoMarginBottom
						checked={ checked }
						disabled={ disabled }
						label={ __( 'Refer hosting' ) }
						onChange={ onReferToggle }
					/>
					<CardDivider />
					<div>
						<Button
							variant="link"
							isBusy={ isLoading }
							disabled={ isLoading }
							onClick={ onTalkToUsClick }
						>
							{ __( 'Buying for your agency? Talk to us ↗' ) }
						</Button>
					</div>
				</VStack>
			</CardBody>
		</Card>
	);
}
