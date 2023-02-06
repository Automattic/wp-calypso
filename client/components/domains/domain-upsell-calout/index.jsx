import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isFreePlanProduct } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import page from 'page';
import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

const DomainUpsellCalout = ( { trackEvent } ) => {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const site = useSelector( ( state ) => getSelectedSite( state ) );
	const trackEventView = `calypso_${ trackEvent }_view`;
	const trackEventClick = `calypso_${ trackEvent }_click`;
	const trackEventDismiss = `calypso_${ trackEvent }_dismiss`;
	const dismissPreference = `${ trackEvent }-${ site.ID }`;
	const isEmailVerified = useSelector( ( state ) => isCurrentUserEmailVerified( state ) );
	const siteDomains = useSelector( ( state ) => getDomainsBySiteId( state, site.ID ) );
	const hasPreferences = useSelector( hasReceivedRemotePreferences );
	const isDismissed = useSelector( ( state ) => getPreference( state, dismissPreference ) );

	const getCtaClickHandler = useCallback( () => {
		recordTracksEvent( trackEventClick );
		page( sprintf( '/domains/add/%s?domainAndPlanPackage=true', site.domain ) );
	}, [ trackEventClick, site.domain ] );

	const getDismissClickHandler = () => {
		recordTracksEvent( trackEventDismiss );
		dispatch( savePreference( dismissPreference, 1 ) );
	};

	if (
		! hasPreferences ||
		isDismissed ||
		siteDomains.length > 1 ||
		! isEmailVerified ||
		! isFreePlanProduct( site.plan )
	) {
		return null;
	}

	return (
		<>
			<TrackComponentView eventName={ trackEventView } />
			<div className="domain-upsell-calout" id="domain-upsell-calout">
				<div className="domain-upsell-calout__content">
					<div className="domain-upsell-calout__content-text">
						<Gridicon icon="globe" size={ 16 } className="domain-upsell-calout__icon" />
						<span className="domain-upsell-calout__domain-name">{ site.domain }</span>
						<button className="domain-upsell-calout__button" onClick={ getCtaClickHandler }>
							<span className="domain-upsell-calout__button-text-desktop">
								{ __( 'Customize your domain' ) }
							</span>
							<span className="domain-upsell-calout__button-text-mobile">
								{ __( 'Customize' ) }
							</span>
						</button>
						<Gridicon
							icon="cross"
							size={ 16 }
							className="domain-upsell-calout__dismiss-icon"
							onClick={ getDismissClickHandler }
						/>
					</div>
				</div>
			</div>
		</>
	);
};

export default DomainUpsellCalout;
