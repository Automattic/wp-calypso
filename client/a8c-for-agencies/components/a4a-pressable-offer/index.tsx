import { Button } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useHelpCenter from 'calypso/a8c-for-agencies/hooks/use-help-center';
import usePressableOwnershipType from 'calypso/a8c-for-agencies/sections/marketplace/hosting-overview/hooks/use-pressable-ownership-type';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import SimpleList from '../simple-list';

import './style.scss';

type Props = {
	isReferMode?: boolean;
};

const PressableOffer = ( { isReferMode }: Props ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ isExpanded, setIsExpanded ] = useState( true );

	const agency = useSelector( getActiveAgency );

	const pressableOwnership = usePressableOwnershipType();

	const { showSupportGuide } = useHelpCenter();

	// Make sure we only show the offer if the agency is a Billing Dragon agency and does not have a Pressable license through A4A, unless we are in referral mode
	const shouldShowOffer =
		agency?.billing_system === 'billingdragon' &&
		( isReferMode ||
			( new Date() <= new Date( '2026-04-30T23:59:59.999Z' ) && pressableOwnership !== 'agency' ) );

	const onToggleView = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_pressable_promo_offer_2026_toggle_view', {
				event_type: ! isExpanded ? 'collapse' : 'expand',
			} )
		);
		setIsExpanded( ( isExpanded ) => ! isExpanded );
	}, [ dispatch, isExpanded ] );

	const onViewEligiblePlansClick = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_pressable_promo_offer_2026_view_eligible_plans_click' )
		);
	}, [ dispatch ] );

	const onSeeFullTermClick = useCallback(
		( e: React.MouseEvent< HTMLButtonElement > ) => {
			e.stopPropagation();
			dispatch(
				recordTracksEvent( 'calypso_a4a_pressable_promo_offer_2026_see_full_terms_click' )
			);
		},
		[ dispatch ]
	);

	const onSeeMigrationBonusTermsClick = useCallback(
		( e: React.MouseEvent< HTMLButtonElement > ) => {
			e.stopPropagation();
			dispatch(
				recordTracksEvent(
					'calypso_a4a_pressable_promo_offer_2026_see_migration_bonus_terms_click'
				)
			);
		},
		[ dispatch ]
	);

	const onSeeMigrationIncentivesTrackingGuideClick = useCallback(
		( e: React.MouseEvent< HTMLButtonElement > ) => {
			e.stopPropagation();
			dispatch(
				recordTracksEvent(
					'calypso_a4a_pressable_promo_offer_2026_see_migration_incentives_tracking_guide_click'
				)
			);
			showSupportGuide(
				'https://agencieshelp.automattic.com/knowledge-base/migration-incentive-tracking/'
			);
		},
		[ dispatch, showSupportGuide ]
	);

	if ( ! shouldShowOffer ) {
		return null;
	}

	return (
		<div
			className={ clsx( 'a4a-pressable-offer', { 'is-expanded': isExpanded } ) }
			onClick={ onToggleView }
			role="button"
			tabIndex={ 0 }
			onKeyDown={ ( event ) => {
				if ( event.key === 'Enter' ) {
					onToggleView();
				}
			} }
		>
			<div className="a4a-pressable-offer__main">
				<h3 className="a4a-pressable-offer__title">
					<span>
						{ translate(
							'Your Exclusive Automattic for Agencies Limited-Time Pressable Offer Just Got Better 🎉'
						) }
					</span>

					<Button className="a4a-pressable-offer__view-toggle-mobile">
						<Icon icon={ chevronDown } size={ 24 } />
					</Button>
				</h3>

				{ isExpanded && (
					<div className="a4a-pressable-offer__body">
						<SimpleList
							items={ [
								translate(
									'{{b}}6 months of free hosting on annual Premium or Signature plans:{{/b}} Purchase a 12-month plan and receive a 50% discount on your first year.',
									{
										components: {
											b: <b />,
										},
									}
								),
								translate(
									'{{b}}3 months of free hosting on monthly plans:{{/b}} Choose a monthly billing cycle and receive savings equal to 3 free months (applied as a discount evenly across the first 12 invoices).',
									{
										components: {
											b: <b />,
										},
									}
								),
								translate(
									'PLUS earn up to $200 for each Signature site and up to $1,000 for each Premium site successfully migrated and {{a}}tagged{{/a}} by the deadline.',
									{
										components: {
											a: (
												<Button
													variant="link"
													onClick={ onSeeMigrationIncentivesTrackingGuideClick }
												/>
											),
										},
									}
								),
								translate(
									'You will continue to earn your standard revenue share and reseller incentives on these accounts.'
								),
							] }
						/>

						<div className="a4a-pressable-offer__body-actions">
							{ ! window.location.pathname.startsWith( A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK ) && (
								<Button
									variant="primary"
									href={ A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK }
									onClick={ onViewEligiblePlansClick }
								>
									{ translate( 'View Eligible Plans' ) }
								</Button>
							) }

							<span className="a4a-pressable-offer__body-actions-footnote">
								{ translate(
									'See terms of Hosting Promotion {{TermLink}}here{{/TermLink}} and the Migration Bonus {{MigrationBonusLink}}here{{/MigrationBonusLink}}',
									{
										components: {
											TermLink: (
												<Button
													variant="link"
													onClick={ onSeeFullTermClick }
													href="https://pressable.com/legal/hosting-promotion-terms/"
													target="_blank"
												/>
											),
											MigrationBonusLink: (
												<Button
													variant="link"
													onClick={ onSeeMigrationBonusTermsClick }
													href="https://pressable.com/legal/migration-bonus-2026/"
													target="_blank"
												/>
											),
										},
									}
								) }
							</span>
						</div>
					</div>
				) }
			</div>
			<Button className="a4a-pressable-offer__view-toggle">
				<Icon icon={ chevronDown } size={ 24 } />
			</Button>
		</div>
	);
};

export default PressableOffer;
