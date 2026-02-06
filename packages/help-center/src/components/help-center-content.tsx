/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenterArticle } from '@automattic/support-articles';
import { CardBody, Disabled } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect, useRef, lazy, Suspense } from '@wordpress/element';
import React from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
/**
 * Internal Dependencies
 */
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useSupportStatus } from '../data/use-support-status';
import { useChatStatus } from '../hooks';
import { HELP_CENTER_STORE } from '../stores';
import { HelpCenterChat } from './help-center-chat';
import { HelpCenterChatHistory } from './help-center-chat-history';
import { HelpCenterContactForm } from './help-center-contact-form';
import { HelpCenterSearch } from './help-center-search';
import { HelpCenterSupportGuides } from './help-center-support-guides';
import { SuccessScreen } from './ticket-success-screen';
import type { HelpCenterSelect } from '@automattic/data-stores';

import './help-center-content.scss';

// Lazy load HelpCenterA4AContactForm to code-split @wordpress/dataviews (and @wordpress/ui).
// The webpack config bundles these packages instead of externalizing them,
// so they won't appear in the asset.json dependencies list.
const HelpCenterA4AContactForm = lazy( () =>
	import( './help-center-a4a-contact-form' ).then( ( module ) => ( {
		default: module.HelpCenterA4AContactForm,
	} ) )
);

// Disabled component only applies the class if isDisabled is true, we want it always.
function Wrapper( {
	isDisabled,
	className,
	children,
}: React.PropsWithChildren< { isDisabled: boolean; className: string } > ) {
	if ( isDisabled ) {
		return (
			<Disabled isDisabled={ isDisabled } className={ className }>
				{ children }
			</Disabled>
		);
	}
	return <div className={ className }>{ children }</div>;
}

const HelpCenterContent: React.FC< { isRelative?: boolean; currentRoute?: string } > = ( {
	currentRoute,
} ) => {
	const location = useLocation();
	const containerRef = useRef< HTMLDivElement >( null );
	const navigate = useNavigate();
	const { setNavigateToRoute } = useDispatch( HELP_CENTER_STORE );
	const { sectionName, site, source, disableChatSupport } = useHelpCenterContext();
	const { data, isLoading: isLoadingSupportStatus } = useSupportStatus();
	const { forceEmailSupport } = useChatStatus();
	const currentSiteDomain = site?.domain;

	const { navigateToRoute, isMinimized, hasPremiumSupport } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			navigateToRoute: store.getNavigateToRoute(),
			isMinimized: store.getIsMinimized(),
			hasPremiumSupport: store.getHasPremiumSupport(),
		};
	}, [] );
	const isUserEligibleForPaidSupport =
		Boolean( data?.eligibility?.is_user_eligible ) || hasPremiumSupport;

	useEffect( () => {
		recordTracksEvent( 'calypso_helpcenter_page_open', {
			pathname: location.pathname,
			search: location.search,
			section: sectionName,
			force_site_id: true,
			location: 'help-center',
			is_free_user: ! isUserEligibleForPaidSupport,
		} );
	}, [ location.pathname, location.search, sectionName, isUserEligibleForPaidSupport ] );

	useEffect( () => {
		if ( navigateToRoute?.route ) {
			const { route, coalesceParams } = navigateToRoute;
			const fullLocation = [ location.pathname, location.search, location.hash ].join( '' );
			// Only navigate once to keep the back button responsive.
			if ( fullLocation !== route ) {
				if ( coalesceParams ) {
					const url = new URL( route, window.location.origin );
					const originalParams = new URLSearchParams( location.search );
					const newParams = new URLSearchParams( url.search );
					newParams.forEach( ( value, key ) => {
						originalParams.set( key, value );
					} );
					navigate( { pathname: url.pathname, search: originalParams.toString() } );
				} else {
					navigate( route );
				}
			}
			setNavigateToRoute( null );
		}
	}, [ navigate, navigateToRoute, setNavigateToRoute, location ] );

	useEffect( () => {
		function handler( event: Event ) {
			const target = event.currentTarget as HTMLDivElement;
			const { clientHeight, scrollHeight, scrollTop } = target;

			// Sadly, Safari doesn't support animation-timeline yet, once it does, you can use the CSS linked below and delete the JS.
			// https://github.com/Automattic/wp-calypso/pull/105777/commits/e07a4f09b045ed5008c1892641f45acd1ebfc514
			target.style.setProperty(
				'--scroll-progress',
				// This keeps opacity at 1 until the scroll reaches bottom - BLENDER_HEIGHT.
				( scrollHeight - clientHeight - scrollTop ).toString()
			);
		}

		if ( containerRef.current ) {
			const container = containerRef.current;
			container.addEventListener( 'scroll', handler );

			if (
				! location.hash &&
				! location.pathname.includes( '/odie' ) &&
				! location.pathname.includes( '/post' )
			) {
				container.scrollTo( 0, 0 );
			}
			return () => {
				container?.removeEventListener( 'scroll', handler );
			};
		}
	}, [ location.hash, location.pathname ] );

	return (
		<CardBody ref={ containerRef } className="help-center__container-content">
			<Wrapper isDisabled={ isMinimized } className="help-center__container-content-wrapper">
				<Routes>
					<Route path="/" element={ <HelpCenterSearch currentRoute={ currentRoute } /> } />
					<Route
						path="/post"
						element={
							<HelpCenterArticle
								sectionName={ sectionName }
								currentSiteDomain={ currentSiteDomain }
								isEligibleForChat={ isUserEligibleForPaidSupport }
								forceEmailSupport={ !! forceEmailSupport || disableChatSupport }
							/>
						}
					/>
					<Route
						path="/contact-form"
						element={
							source === 'a4a' ? (
								<Suspense fallback={ null }>
									<HelpCenterA4AContactForm />
								</Suspense>
							) : (
								<HelpCenterContactForm />
							)
						}
					/>
					<Route path="/success" element={ <SuccessScreen /> } />
					<Route
						path="/support-guides"
						element={ <HelpCenterSupportGuides currentRoute={ currentRoute } /> }
					/>
					<Route
						path="/odie"
						element={
							<HelpCenterChat
								isLoadingStatus={ isLoadingSupportStatus }
								isUserEligibleForPaidSupport={ isUserEligibleForPaidSupport }
							/>
						}
					/>
					<Route path="/chat-history" element={ <HelpCenterChatHistory /> } />
				</Routes>
			</Wrapper>
		</CardBody>
	);
};

export default HelpCenterContent;
