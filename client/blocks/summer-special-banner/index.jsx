import { Card } from '@automattic/components';
import { Button } from '@wordpress/components';
import { Icon, close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';

import './style.scss';

const SUMMER_SPECIAL_BANNER_PREFERENCE = 'dismissible-card-plugins-offer-2025';

export default function SummerSpecialBanner( { hasTargetPlan = false } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const moment = useLocalizedMoment();

	const isDismissed = useSelector( ( state ) => {
		const preference = getPreference( state, SUMMER_SPECIAL_BANNER_PREFERENCE );
		return !! preference;
	} );

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
		<Card className="summer-special-banner">
			<div className="summer-special-banner__content">
				<div className="summer-special-banner__text">
					<span className="summer-special-banner__title">
						{ translate(
							// translate: %(date)s is a date string in the format of "August 25, 2025"
							'One-time offer: Install plugins available in all paid plans. Valid until %(date)s!',
							{
								args: { date: moment( '2025-08-25' ).format( 'LL' ) },
							}
						) }
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
	);
}
