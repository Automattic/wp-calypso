import { isEnabled } from '@automattic/calypso-config';
import { formatCurrency } from '@automattic/number-formatters';
import { Button } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { A4A_MARKETPLACE_HOSTING_REFER_PRESSABLE_PREMIUM_PLAN_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import {
	PRESSABLE_PREMIUM_PLAN_COMMISSION_PERCENTAGE,
	PRESSABLE_PREMIUM_PLAN_COMMISSION_AMOUNT,
} from 'calypso/a8c-for-agencies/sections/marketplace/lib/constants';
import MigrationIncentiveIcon from 'calypso/assets/images/a8c-for-agencies/migration-incentive-icon.svg';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

export default function PressablePremiumPlanMigrationBanner( {
	isCollapsable = true,
}: {
	isCollapsable?: boolean;
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isFeatureEnabled = isEnabled( 'pressable-premium-plan' );

	const [ isExpanded, setIsExpanded ] = useState( true );

	const onToggleView = useCallback( () => {
		setIsExpanded( ( isExpanded ) => ! isExpanded );
	}, [] );

	const handleReferClient = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_marketplace_hosting_premium_refer_form_back_to_marketplace' )
		);
	}, [ dispatch ] );

	const handleChatToUs = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_marketplace_hosting_premium_refer_form_back_to_marketplace' )
		);
		// TODO: Add chat to us logic
	}, [ dispatch ] );

	const buttons = (
		<>
			<Button
				variant="primary"
				href={ A4A_MARKETPLACE_HOSTING_REFER_PRESSABLE_PREMIUM_PLAN_LINK }
				onClick={ handleReferClient }
			>
				{ translate( 'Refer client now' ) }
			</Button>
			<Button variant="secondary" onClick={ handleChatToUs }>
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

	if ( ! isFeatureEnabled ) {
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
