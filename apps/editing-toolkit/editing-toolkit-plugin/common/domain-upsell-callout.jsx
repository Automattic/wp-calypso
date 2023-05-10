import { recordTracksEvent } from '@automattic/calypso-analytics';
// import { isFreePlanProduct } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { select, subscribe } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { globe, Icon } from '@wordpress/icons';
import useTranslate from 'i18n-calypso';
import { useCallback, createElement } from 'react';
import { render } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { isP2Site } from 'calypso/sites-dashboard/utils';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './domain-upsell-callout.scss';

const isEditorReady = async () =>
	new Promise( ( resolve ) => {
		const unsubscribe = subscribe( () => {
			// Calypso sends the message as soon as the iframe is loaded, so we
			// need to be sure that the editor is initialized and the core blocks
			// registered. There is an unstable selector for that, so we use
			// `isCleanNewPost` otherwise which is triggered when everything is
			// initialized if the post is new.
			const editorIsReady = select( 'core/editor' ).__unstableIsEditorReady
				? select( 'core/editor' ).__unstableIsEditorReady()
				: select( 'core/editor' ).isCleanNewPost();
			if ( editorIsReady ) {
				unsubscribe();
				resolve();
			}
		} );
	} );

const shouldShowDomainUpsell = () => {
	const postType = select( 'core/editor' ).getCurrentPostType();
	const isDismissed = select( 'core/preferences' ).get(
		'core/edit-post',
		'domain_upsell_callout_dismiss'
	);
	return ! isDismissed && ( postType === 'post' || postType === 'page' );
};

const DomainUpsellCallout = ( { trackEvent } ) => {
	const dispatch = useDispatch();
	const site = useSelector( ( state ) => getSelectedSite( state ) );
	const trackEventView = `calypso_${ trackEvent }_view`;
	const trackEventClick = `calypso_${ trackEvent }_click`;
	const trackEventDismiss = `calypso_${ trackEvent }_dismiss`;
	const dismissPreference = `${ trackEvent }-${ site?.ID }`;
	const isEmailVerified = useSelector( ( state ) => isCurrentUserEmailVerified( state ) );
	const siteDomains = useSelector( ( state ) => getDomainsBySiteId( state, site?.ID ) );
	const siteDomainsLength = useMemo(
		() => siteDomains.filter( ( domain ) => ! domain.isWPCOMDomain ).length,
		[ siteDomains ]
	);
	const hasPreferences = useSelector( hasReceivedRemotePreferences );
	const isDismissed = useSelector( ( state ) => getPreference( state, dismissPreference ) );
	const translate = useTranslate();

	const getCtaClickHandler = useCallback( () => {
		recordTracksEvent( trackEventClick );
		// page( `/domains/add/${ site?.domain }?domainAndPlanPackage=true` );
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
		// ! isFreePlanProduct( site.plan ) ||
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
								{ translate( 'Customize your domain' ) }
							</span>
							<span className="domain-upsell-callout__button-text-mobile">
								{ translate( 'Customize' ) }
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

async function showDomainUpsellCallout() {
	await isEditorReady();
	if ( shouldShowDomainUpsell() ) {
		const toolbarContainer = document.querySelector( '.edit-post-header-toolbar' );
		render( createElement( DomainUpsellCallout ), toolbarContainer );
	}
}

showDomainUpsellCallout();
