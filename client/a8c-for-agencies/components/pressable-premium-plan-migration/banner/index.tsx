import { formatCurrency } from '@automattic/number-formatters';
import { Button } from '@wordpress/components';
import { Icon, chevronDown, external } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { A4A_MARKETPLACE_HOSTING_REFER_PRESSABLE_PREMIUM_PLAN_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useScheduleCall from 'calypso/a8c-for-agencies/hooks/use-schedule-call';
import {
	PRESSABLE_PREMIUM_PLAN_COMMISSION_PERCENTAGE,
	PRESSABLE_PREMIUM_PLAN_COMMISSION_AMOUNT,
} from 'calypso/a8c-for-agencies/sections/marketplace/lib/constants';
import MigrationIncentiveIcon from 'calypso/assets/images/a8c-for-agencies/migration-incentive-icon.svg';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useShowMigrationIncentive } from '../hook/use-show-migration-incentive';

import './style.scss';

export default function PressablePremiumPlanMigrationBanner( {
	isCollapsable = true,
	source,
}: {
	isCollapsable?: boolean;
	source: string;
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ isExpanded, setIsExpanded ] = useState( true );

	const onToggleView = useCallback( () => {
		setIsExpanded( ( isExpanded ) => ! isExpanded );
	}, [] );

	const showMigrationIncentive = useShowMigrationIncentive();

	const { scheduleCall, isLoading } = useScheduleCall();

	const handleReferClient = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_pressable_premium_plan_migration_banner_refer_client', {
				source,
			} )
		);
	}, [ dispatch, source ] );

	const handleChatToUs = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_pressable_premium_plan_migration_banner_chat_to_us', {
				source,
			} )
		);
		scheduleCall();
	}, [ dispatch, scheduleCall, source ] );

	const buttons = (
		<>
			<Button
				variant="primary"
				href={ A4A_MARKETPLACE_HOSTING_REFER_PRESSABLE_PREMIUM_PLAN_LINK }
				onClick={ handleReferClient }
			>
				{ translate( 'Refer client now' ) }
			</Button>
			<Button
				className="pressable-premium-plan-migration__chat-to-us-button"
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
		</>
	);

	const terms = (
		<span>
			{ translate( 'Offer ends September 30, 2025. {{a}}Terms{{/a}} ↗', {
				components: {
					a: (
						<Button
							className="pressable-premium-plan-migration__terms-link"
							variant="link"
							href="https://automattic.com/for-agencies/program-incentives"
							target="_blank"
						/>
					),
				},
			} ) }
		</span>
	);

	if ( ! showMigrationIncentive ) {
		return null;
	}

	return (
		<div className={ clsx( 'pressable-premium-plan-migration', { 'is-expanded': isExpanded } ) }>
			{ ! isCollapsable && (
				<img
					className="pressable-premium-plan-migration__icon"
					src={ MigrationIncentiveIcon }
					alt=""
				/>
			) }

			<div className="pressable-premium-plan-migration__main">
				<h3 className="pressable-premium-plan-migration__title">
					{ translate(
						"Get up to %(price)s when you migrate your client's Woo store to Pressable Premium",
						{
							args: {
								price: formatCurrency( 2500, 'USD', {
									stripZeros: true,
								} ),
							},
						}
					) }
					{ isCollapsable && (
						<Button
							className="pressable-premium-plan-migration__view-toggle-mobile"
							onClick={ onToggleView }
						>
							<Icon icon={ chevronDown } size={ 24 } />
						</Button>
					) }
				</h3>

				{ isExpanded && (
					<>
						<div className="pressable-premium-plan-migration__body">
							<p className="pressable-premium-plan-migration__description">
								<span>
									{ translate(
										"Switch your client's Woo store to scalable, high-performance Pressable Premium hosting, and we'll give you up to %(price)s or %(commission)s%% commission. We'll also optimize your site's performance and provide a white glove migration, ensuring a seamless and stress-free transition.",
										{
											args: {
												price: formatCurrency( PRESSABLE_PREMIUM_PLAN_COMMISSION_AMOUNT, 'USD', {
													stripZeros: true,
												} ),
												commission: PRESSABLE_PREMIUM_PLAN_COMMISSION_PERCENTAGE,
											},
										}
									) }
								</span>
								{ ! isCollapsable && terms }
							</p>
							{ ! isCollapsable && (
								<div className="pressable-premium-plan-migration__button-container">
									{ buttons }
								</div>
							) }
						</div>
						{ isCollapsable && (
							<div className="pressable-premium-plan-migration__collapsable-buttons-container">
								{ buttons }
								{ terms }
							</div>
						) }
					</>
				) }
			</div>

			{ isCollapsable && (
				<Button className="pressable-premium-plan-migration__view-toggle" onClick={ onToggleView }>
					<Icon icon={ chevronDown } size={ 24 } />
				</Button>
			) }
		</div>
	);
}
