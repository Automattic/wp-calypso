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

const PRESSABLE_Q3_2026_DEADLINE = new Date( '2026-09-30T23:59:59.999Z' );
const FULL_TERMS_URL = 'https://pressable.com/legal/hosting-promotion-terms/';

const PressableOffer = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ isExpanded, setIsExpanded ] = useState( true );

	const agency = useSelector( getActiveAgency );

	const pressableOwnership = usePressableOwnershipType();

	const shouldShowOffer =
		agency?.billing_system === 'billingdragon' &&
		pressableOwnership !== 'agency' &&
		new Date() <= PRESSABLE_Q3_2026_DEADLINE;

	const onToggleView = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_pressable_promo_offer_q3_2026_toggle_view', {
				event_type: isExpanded ? 'collapse' : 'expand',
			} )
		);
		setIsExpanded( ( isExpanded ) => ! isExpanded );
	}, [ dispatch, isExpanded ] );

	const onSeeFullTermsClick = useCallback(
		( e: React.MouseEvent< HTMLAnchorElement | HTMLButtonElement > ) => {
			e.stopPropagation();
			dispatch(
				recordTracksEvent( 'calypso_a4a_pressable_promo_offer_q3_2026_see_full_terms_click' )
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
									'{{b}}6 months free on annual plans:{{/b}} Purchase a 12-month plan and receive a 50% discount on the upfront cost.',
									{
										components: {
											b: <b />,
										},
									}
								),
								translate(
									'{{b}}3 months free on monthly plans:{{/b}} Choose a monthly billing cycle and receive savings equal to 3 free months (applied as a discount evenly across the first 12 invoices).',
									{
										components: {
											b: <b />,
										},
									}
								),
								translate(
									'{{b}}Automattic for Agencies exclusive:{{/b}} As a partner, you can unlock these savings on Pressable’s full Signature Plan suite in addition to Premium plans.',
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
								{ translate( '*Offer valid August 11 – September 30, 2026' ) }
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
