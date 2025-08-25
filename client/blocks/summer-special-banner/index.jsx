import { isPremiumPlan, isPersonalPlan } from '@automattic/calypso-products';
import { Card } from '@automattic/components';
import { Button } from '@wordpress/components';
import { Icon, close } from '@wordpress/icons';
import clsx from 'clsx';
import i18n, { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';

import './style.scss';

const SUMMER_SPECIAL_BANNER_PREFERENCE = 'dismissible-card-plugins-offer-2025';

export default function SummerSpecialBanner( { visiblePlans = [], isFixed = false } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isDismissed = useSelector( ( state ) => {
		const preference = getPreference( state, SUMMER_SPECIAL_BANNER_PREFERENCE );
		return !! preference;
	} );
	// Check if Premium or Personal plans are visible for the banner
	const hasTargetPlan = visiblePlans?.some(
		( { planSlug, isVisible } ) =>
			isVisible && ( isPremiumPlan( planSlug ) || isPersonalPlan( planSlug ) )
	);

	const dismiss = useCallback(
		( event ) => {
			event.preventDefault();
			dispatch( savePreference( SUMMER_SPECIAL_BANNER_PREFERENCE, true ) );
		},

		[ dispatch ]
	);

	// Don't show if already dismissed or no target plan in grid
	if ( isDismissed || ! hasTargetPlan ) {
		return null;
	}

	return (
		<div
			className={ clsx( 'summer-special-banner-wrapper', {
				'summer-special-banner-wrapper--fixed': isFixed,
			} ) }
		>
			<Card
				className={ clsx( 'summer-special-banner', { 'summer-special-banner--fixed': isFixed } ) }
			>
				<div className="summer-special-banner__content">
					<div className="summer-special-banner__text">
						<span className="summer-special-banner__title">
							{ i18n.fixMe( {
								text: 'Until %(date)s: Unlock plugin access on new Personal and Premium plans.',
								newCopy: translate(
									// translate: %(date)s is a date string in the format of "August 25, 2025"
									'Until %(date)s: Unlock plugin access on new Personal and Premium plans.',
									{
										args: {
											date: new Intl.DateTimeFormat( translate.localeSlug || 'en-US', {
												month: 'long',
												day: 'numeric',
											} ).format( new Date( '2025-08-25' ) ),
										},
									}
								),
								oldCopy: translate(
									// translate: %(date)s is a date string in the format of "August 25, 2025"
									'One-time offer: Install plugins available in all paid plans. Valid until %(date)s!',
									{
										args: {
											date: new Intl.DateTimeFormat( translate.localeSlug || 'en-US', {
												month: 'long',
												day: 'numeric',
											} ).format( new Date( '2025-08-25' ) ),
										},
									}
								),
							} ) }
						</span>
					</div>
				</div>
				<Button
					className="summer-special-banner__close"
					variant="tertiary"
					onClick={ dismiss }
					aria-label={ translate( 'Dismiss banner' ) }
				>
					<Icon icon={ close } size={ 24 } />
				</Button>
			</Card>
		</div>
	);
}
