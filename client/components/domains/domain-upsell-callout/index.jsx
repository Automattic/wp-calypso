import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isFreePlanProduct } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { useMemo } from '@wordpress/element';
import { globe, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { isP2Site } from 'calypso/sites-dashboard/utils';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

const DomainUpsellCallout = ( { trackEvent } ) => {
	const dispatch = useDispatch();
	const site = useSelector( getSelectedSite );
	const trackEventView = `calypso_${ trackEvent }_view`;
	const trackEventClick = `calypso_${ trackEvent }_click`;
	const trackEventDismiss = `calypso_${ trackEvent }_dismiss`;
	const dismissPreference = `${ trackEvent }-${ site?.ID }`;
	const isEmailVerified = useSelector( isCurrentUserEmailVerified );
	const siteDomains = useSelector( ( state ) => getDomainsBySiteId( state, site?.ID ) );
	const siteDomainsLength = useMemo(
		() => siteDomains.filter( ( domain ) => ! domain.isWPCOMDomain ).length,
		[ siteDomains ]
	);
	const hasPreferences = useSelector( hasReceivedRemotePreferences );
	const isDismissed = useSelector( ( state ) => getPreference( state, dismissPreference ) );
	const { __ } = useI18n();

	const getCtaClickHandler = useCallback( () => {
		recordTracksEvent( trackEventClick );
		page( `/domains/add/${ site?.domain }?domainAndPlanPackage=true` );
	}, [ trackEventClick, site?.domain ] );

	const getDismissClickHandler = () => {
		recordTracksEvent( trackEventDismiss );
		dispatch( savePreference( dismissPreference, 1 ) );
	};

	if (
		! site ||
		! hasPreferences ||
		isDismissed ||
		siteDomainsLength ||
		! isEmailVerified ||
		! isFreePlanProduct( site.plan ) ||
		isP2Site( site )
	) {
		return null;
	}

	return (
		<>
			<TrackComponentView eventName={ trackEventView } />
			<div className="domain-upsell-callout">
				<div className="domain-upsell-callout__content">
					<div className="domain-upsell-callout__content-text">
						<Icon icon={ globe } size={ 16 } />
						<span className="domain-upsell-callout__domain-name">{ site.domain }</span>
						<button className="domain-upsell-callout__button" onClick={ getCtaClickHandler }>
							<span className="domain-upsell-callout__button-text-desktop">
								{ __( 'Customize your domain' ) }
							</span>
							<span className="domain-upsell-callout__button-text-mobile">
								{ __( 'Customize' ) }
							</span>
						</button>
						<Gridicon
							icon="cross"
							size={ 16 }
							className="domain-upsell-callout__dismiss-icon"
							onClick={ getDismissClickHandler }
						/>
					</div>
				</div>
			</div>
		</>
	);
};

export default DomainUpsellCallout;
