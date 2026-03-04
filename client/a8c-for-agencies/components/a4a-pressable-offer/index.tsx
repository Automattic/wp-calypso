import { Button } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
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

	const onSeeFullTermClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_pressable_promo_offer_2026_see_full_terms_click' ) );
	}, [ dispatch ] );

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
							'{{b}}Limited time offer:{{/b}} Get up to 6 months of free Pressable hosting on new plans!',
							{
								components: {
									b: <b />,
								},
							}
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
									'{{b}}6 Months Free on Annual Plans:{{/b}} Purchase a 12-month plan and receive a 50% discount on the upfront cost.',
									{
										components: {
											b: <b />,
										},
									}
								),
								translate(
									'{{b}}3 Months Free on Monthly Plans:{{/b}} Choose a monthly billing cycle and receive savings equal to 3 free months (applied as a discount evenly across the first 12 invoices).',
									{
										components: {
											b: <b />,
										},
									}
								),
								translate(
									'{{b}}Automattic for Agencies Exclusive:{{/b}} As a partner, you can unlock these savings on Pressable’s full Signature Plan suite in addition to Premium plans.',
									{
										components: {
											b: <b />,
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

							<Button
								variant="secondary"
								href="https://pressable.com/legal/hosting-promotion-terms/"
								target="_blank"
								rel="noopener noreferrer"
								onClick={ onSeeFullTermClick }
							>
								{ translate( 'See full terms ↗' ) }
							</Button>

							<span className="a4a-pressable-offer__body-actions-footnote">
								{ translate( '*Offer valid January 27 - April 30, 2026' ) }
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
