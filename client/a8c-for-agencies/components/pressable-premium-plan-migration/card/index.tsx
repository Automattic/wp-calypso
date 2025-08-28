import { formatCurrency } from '@automattic/number-formatters';
import { Card, Button } from '@wordpress/components';
import { close, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { A4A_MARKETPLACE_HOSTING_REFER_PRESSABLE_PREMIUM_PLAN_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useScheduleCall from 'calypso/a8c-for-agencies/hooks/use-schedule-call';
import { PRESSABLE_PREMIUM_PLAN_COMMISSION_AMOUNT } from 'calypso/a8c-for-agencies/sections/marketplace/lib/constants';
import PressableWooMigrationIcon from 'calypso/assets/images/a8c-for-agencies/pressable-woo-migration-icon.svg';
import { preventWidows } from 'calypso/lib/formatting';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { useShowMigrationIncentive } from '../hook/use-show-migration-incentive';

import './style.scss';

const DISMISSED_PREFERENCE = 'a4a_pressable_premium_plan_migration_card_dismissed';

export default function PressablePremiumPlanMigrationCard() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isDismissed = useSelector( ( state ) => getPreference( state, DISMISSED_PREFERENCE ) );

	const showMigrationIncentive = useShowMigrationIncentive();

	const { scheduleCall, isLoading } = useScheduleCall();

	const onDismiss = useCallback( () => {
		dispatch(
			recordTracksEvent(
				'calypso_a4a_overview_pressable_premium_plan_migration_card_dismiss_click'
			)
		);
		dispatch( savePreference( DISMISSED_PREFERENCE, true ) );
	}, [ dispatch ] );

	const handleReferClient = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_overview_pressable_premium_plan_migration_card_refer_click' )
		);
	}, [ dispatch ] );

	const handleChatToUs = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_overview_pressable_premium_plan_migration_card_chat_click' )
		);
		scheduleCall();
	}, [ dispatch, scheduleCall ] );

	if ( isDismissed || ! showMigrationIncentive ) {
		return null;
	}

	return (
		<Card className="pressable-premium-plan-migration-card">
			<div className="pressable-premium-plan-migration-card__top">
				<img src={ PressableWooMigrationIcon } alt="" />
				<Button variant="tertiary" icon={ close } onClick={ onDismiss } />
			</div>

			<div className="pressable-premium-plan-migration-card__content">
				<h3>
					{ translate( "Switch your client's Woo store to Pressable and earn up to %(price)s", {
						args: {
							price: formatCurrency( PRESSABLE_PREMIUM_PLAN_COMMISSION_AMOUNT, 'USD', {
								stripZeros: true,
							} ),
						},
					} ) }
				</h3>

				<div className="pressable-premium-plan-migration-card__description">
					{ preventWidows(
						translate(
							"Move your client's store to Pressable's Premium WordPress hosting and unlock up to %(price)s—plus free, expert-led migration.",
							{
								args: {
									price: formatCurrency( PRESSABLE_PREMIUM_PLAN_COMMISSION_AMOUNT, 'USD', {
										stripZeros: true,
									} ),
								},
							}
						)
					) }
				</div>

				<div className="pressable-premium-plan-migration-card__buttons">
					<Button
						className="is-light pressable-premium-plan-migration-card__primary-button"
						href={ A4A_MARKETPLACE_HOSTING_REFER_PRESSABLE_PREMIUM_PLAN_LINK }
						onClick={ handleReferClient }
					>
						{ translate( 'Refer client now' ) }
					</Button>
					<Button
						className="is-light pressable-premium-plan-migration-card__chat-to-us-button"
						variant="secondary"
						icon={ external }
						iconPosition="right"
						iconSize={ 16 }
						onClick={ handleChatToUs }
						isBusy={ isLoading }
						disabled={ isLoading }
					>
						{ translate( 'Chat to us about this offer' ) }
					</Button>
				</div>

				<div className="pressable-premium-plan-migration-card__description">
					{ translate( 'Offer ends September 30, 2025. {{a}}Terms{{/a}} ↗', {
						components: {
							a: (
								<Button
									className="is-light"
									variant="link"
									href="https://automattic.com/for-agencies/program-incentives"
									target="_blank"
								/>
							),
						},
					} ) }
				</div>
			</div>
		</Card>
	);
}
