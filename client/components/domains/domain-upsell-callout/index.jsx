import { recordTracksEvent } from '@automattic/calypso-analytics';
// import { isFreePlanProduct } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import page from 'page';
import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
// import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
// import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
// import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
// import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

const DomainUpsellCallout = ( { trackEvent, isLaunchpad, isPhone } ) => {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	// INFO
	// Currently the site object is undefined when rendering this component inside the Launchpad and it's causing a lot of problems
	// I am assuming it's reading from the wrong store since this component is currently used in the block editor
	// I was expecting the useSite() to work here since that's what we're using in Launchpad but for some reason it's undefined
	// Maybe we should consider passing the site as a prop if we are unable to fix the selectors here
	const site = useSelector( ( state ) => getSelectedSite( state ) );
	// const site = useSite();
	const trackEventView = `calypso_${ trackEvent }_view`;
	const trackEventClick = `calypso_${ trackEvent }_click`;
	const trackEventDismiss = `calypso_${ trackEvent }_dismiss`;
	const dismissPreference = `${ trackEvent }-${ site?.ID }`;
	// const isEmailVerified = useSelector( ( state ) => isCurrentUserEmailVerified( state ) );
	// const siteDomains = useSelector( ( state ) => getDomainsBySiteId( state, site?.ID ) );
	// const hasPreferences = useSelector( hasReceivedRemotePreferences );
	// const isDismissed = useSelector( ( state ) => getPreference( state, dismissPreference ) );

	const getCtaClickHandler = useCallback( () => {
		recordTracksEvent( trackEventClick );
		page( `/domains/add/${ site?.domain }?domainAndPlanPackage=true` );
	}, [ trackEventClick, site?.domain ] );

	const getDismissClickHandler = () => {
		recordTracksEvent( trackEventDismiss );
		dispatch( savePreference( dismissPreference, 1 ) );
	};

	// INFO
	// I'm bypassing all of these checks to make sure the component renders inside Launchpad but we should come back to this and decide which one of these checks makes sense inside Launchpad and keep them
	// if (
	// 	! site ||
	// 	! hasPreferences ||
	// 	isDismissed ||
	// 	siteDomains.length > 1 ||
	// 	! isEmailVerified ||
	// 	! isFreePlanProduct( site.plan )
	// ) {
	// 	return null;
	// }

	return (
		<>
			<TrackComponentView eventName={ trackEventView } />
			<div
				className={ classnames( 'domain-upsell-callout', {
					// INFO
					// I'm using these CSS classes to apply custom styles for our Launchpad use case
					'is-launchpad': isLaunchpad,
					'is-phone': isPhone,
				} ) }
			>
				<div className="domain-upsell-callout__content">
					<div className="domain-upsell-callout__content-text">
						<Gridicon icon="globe" size={ 16 } className="domain-upsell-callout__icon" />
						<span className="domain-upsell-callout__domain-name">
							{ /* INFO */ }
							{ /* I am hardcoding the site slug here since the site object is undefined and it's breaking the component */ }
							sharpirate.wordpress.com
						</span>
						<button className="domain-upsell-callout__button" onClick={ getCtaClickHandler }>
							<span className="domain-upsell-callout__button-text-desktop">
								{ __( 'Customize your domain' ) }
							</span>
							<span className="domain-upsell-callout__button-text-mobile">
								{ __( 'Customize' ) }
							</span>
						</button>
						{ /* INFO */ }
						{ /* We don't want the close button as per our Launchpad design */ }
						{ ! isLaunchpad && (
							<Gridicon
								icon="cross"
								size={ 16 }
								className="domain-upsell-callout__dismiss-icon"
								onClick={ getDismissClickHandler }
							/>
						) }
					</div>
				</div>
			</div>
		</>
	);
};

export default DomainUpsellCallout;
