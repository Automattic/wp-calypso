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

const DomainUpsell = () => {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const site = useSelector( ( state ) => getSelectedSite( state ) );
	const isEmailVerified = useSelector( ( state ) => isCurrentUserEmailVerified( state ) );
	const siteDomains = useSelector( ( state ) => getDomainsBySiteId( state, site.ID ) );
	const hasPreferences = useSelector( hasReceivedRemotePreferences );
	const dismissPreference = `site_editor_domain_upsell-${ site.ID }`;
	const isDismissed = useSelector( ( state ) => getPreference( state, dismissPreference ) );

	const getCtaClickHandler = useCallback( () => {
		recordTracksEvent( 'calypso_site_editor_domain_upsell_search_click' );
		page( sprintf( '/domains/add/%s?domainAndPlanPackage=true', site.domain ) );
	}, [ site.domain ] );

	const getDismissClickHandler = () => {
		recordTracksEvent( 'calypso_site_editor_domain_upsell_search_dismiss' );
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
			<TrackComponentView eventName="calypso_site_preview_domain_upsell_search_view" />
			<div className="domain-upsell" id="domain-upsell">
				<div className="domain-upsell__content">
					<div className="domain-upsell__content-text">
						<Gridicon icon="globe" size={ 16 } className="domain-upsell__icon" />
						<span className="domain-upsell__domain-name">{ site.domain }</span>
						<button className="domain-upsell__button" onClick={ getCtaClickHandler }>
							<span className="domain-upsell__button-text-desktop">
								{ __( 'Customize your domain' ) }
							</span>
							<span className="domain-upsell__button-text-mobile">{ __( 'Customize' ) }</span>
						</button>
						<Gridicon
							icon="cross"
							size={ 16 }
							className="domain-upsell__dismiss-icon"
							onClick={ getDismissClickHandler }
						/>
					</div>
				</div>
			</div>
		</>
	);
};

export default DomainUpsell;
