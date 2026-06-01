import { Button } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import usePressableOwnershipType from 'calypso/a8c-for-agencies/sections/marketplace/hosting-overview/hooks/use-pressable-ownership-type';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import SimpleList from '../simple-list';

import './style.scss';

const PRESSABLE_Q2_2026_DEADLINE = new Date( '2026-06-30T23:59:59.999Z' );
const CONTACT_SALES_MAILTO =
	'mailto:partnerships@automattic.com?subject=Pressable%20Summer%202026%20Promo';
const FULL_TERMS_URL =
	'https://pressable.com/legal/summer-2026-migration-bonus-terms-and-conditions/';

const PressableOffer = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ isExpanded, setIsExpanded ] = useState( true );

	const agency = useSelector( getActiveAgency );

	const pressableOwnership = usePressableOwnershipType();

	const shouldShowOffer =
		agency?.billing_system === 'billingdragon' &&
		pressableOwnership !== 'agency' &&
		new Date() <= PRESSABLE_Q2_2026_DEADLINE;

	const onToggleView = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_pressable_promo_offer_q2_2026_toggle_view', {
				event_type: isExpanded ? 'collapse' : 'expand',
			} )
		);
		setIsExpanded( ( isExpanded ) => ! isExpanded );
	}, [ dispatch, isExpanded ] );

	const onContactSalesClick = useCallback(
		( e: React.MouseEvent< HTMLAnchorElement | HTMLButtonElement > ) => {
			e.stopPropagation();
			dispatch(
				recordTracksEvent( 'calypso_a4a_pressable_promo_offer_q2_2026_contact_sales_click' )
			);
		},
		[ dispatch ]
	);

	const onSeeFullTermsClick = useCallback(
		( e: React.MouseEvent< HTMLAnchorElement | HTMLButtonElement > ) => {
			e.stopPropagation();
			dispatch(
				recordTracksEvent( 'calypso_a4a_pressable_promo_offer_q2_2026_see_full_terms_click' )
			);
		},
		[ dispatch ]
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
				if ( event.key === 'Enter' || event.key === ' ' ) {
					event.preventDefault();
					onToggleView();
				}
			} }
		>
			<div className="a4a-pressable-offer__main">
				<h3 className="a4a-pressable-offer__title">
					<span>{ translate( 'Earn up to 35% cash back on Pressable. Offer ends June 30!' ) }</span>

					<Button className="a4a-pressable-offer__view-toggle-mobile">
						<Icon icon={ chevronDown } size={ 24 } />
					</Button>
				</h3>

				{ isExpanded && (
					<div className="a4a-pressable-offer__body">
						<p className="a4a-pressable-offer__intro">
							{ translate(
								'Migrate your clients to Pressable and earn up to $50,000 back. Plans starting at 15% back for 12 months, up to 35% for 36 months. {{em}}All deals must be registered through the Automattic for Agencies team to qualify.{{/em}}',
								{
									components: {
										em: <em />,
									},
								}
							) }
						</p>

						<SimpleList
							items={ [
								translate(
									'{{b}}Payout:{{/b}} 15% back (12-month plan), 25% back (24-month plan), 35% back (36-month plan)',
									{
										components: {
											b: <b />,
										},
									}
								),
								translate( '{{b}}Max payout:{{/b}} $50,000 per agency', {
									components: {
										b: <b />,
									},
								} ),
								translate( '{{b}}Payout date:{{/b}} July 15, 2027', {
									components: {
										b: <b />,
									},
								} ),
								translate(
									'{{b}}Not eligible:{{/b}} Migrations from WordPress VIP or WordPress.com to Pressable',
									{
										components: {
											b: <b />,
										},
									}
								),
							] }
						/>

						<div className="a4a-pressable-offer__body-actions">
							<Button
								variant="primary"
								href={ CONTACT_SALES_MAILTO }
								onClick={ onContactSalesClick }
							>
								{ translate( 'Contact sales to claim this offer' ) }
							</Button>

							<Button
								variant="secondary"
								href={ FULL_TERMS_URL }
								target="_blank"
								rel="noopener noreferrer"
								onClick={ onSeeFullTermsClick }
							>
								{ translate( 'See full terms ↗' ) }
							</Button>

							<span className="a4a-pressable-offer__body-actions-footnote">
								{ translate( '*Offer valid May 21 – June 30, 2026' ) }
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
