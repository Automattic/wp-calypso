/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import OdieAssistantProvider, { useSetOdieStorage } from '@automattic/odie-client';
import { CardBody, Disabled } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import React, { useCallback, useState } from 'react';
import { Route, Routes, useLocation, Navigate, useNavigate } from 'react-router-dom';
/**
 * Internal Dependencies
 */
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useShouldUseWapuu } from '../hooks';
import { HELP_CENTER_STORE } from '../stores';
import { HelpCenterArticle } from './help-center-article';
import { HelpCenterContactForm } from './help-center-contact-form';
import { HelpCenterContactPage } from './help-center-contact-page';
import { HelpCenterMessenger } from './help-center-messenger';
import { HelpCenterOdie } from './help-center-odie';
import { HelpCenterSearch } from './help-center-search';
import { SuccessScreen } from './ticket-success-screen';
import type { HelpCenterSelect } from '@automattic/data-stores';

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
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const location = useLocation();
	const containerRef = useRef< HTMLDivElement >( null );
	const navigate = useNavigate();
	const { setNavigateToRoute } = useDispatch( HELP_CENTER_STORE );
	const { sectionName, currentUser, site } = useHelpCenterContext();
	const shouldUseWapuu = useShouldUseWapuu();
	const { isMinimized } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			isMinimized: store.getIsMinimized(),
		};
	}, [] );

	const navigateToSupportDocs = useCallback(
		( blogId: string, postId: string, title: string, link: string ) => {
			navigate(
				`/post?blogId=${ blogId }&postId=${ postId }&title=${ title }&link=${ link }&backUrl=/odie`
			);
		},
		[ navigate ]
	);

	useEffect( () => {
		recordTracksEvent( 'calypso_helpcenter_page_open', {
			pathname: location.pathname,
			search: location.search,
			section: sectionName,
			force_site_id: true,
			location: 'help-center',
		} );
	}, [ location, sectionName ] );

	const { navigateToRoute } = useSelect(
		( select ) => ( {
			navigateToRoute: ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getNavigateToRoute(),
		} ),
		[]
	);

	useEffect( () => {
		if ( navigateToRoute ) {
			navigate( navigateToRoute );
			setNavigateToRoute( null );
		}
	}, [ navigate, navigateToRoute, setNavigateToRoute ] );

	// reset the scroll location on navigation, TODO: unless there's an anchor
	useEffect( () => {
		setSearchTerm( '' );
		if ( containerRef.current ) {
			containerRef.current.scrollTo( 0, 0 );
		}
	}, [ location ] );

	const trackEvent = useCallback(
		( eventName: string, properties: Record< string, unknown > = {} ) => {
			recordTracksEvent( eventName, properties );
		},
		[]
	);

	const setOdieStorage = useSetOdieStorage( 'chat_id' );

	const navigateToContactOptions = useCallback( () => {
		navigate( '/contact-options' );
	}, [ navigate ] );

	return (
		<CardBody ref={ containerRef } className="help-center__container-content">
			<Wrapper isDisabled={ isMinimized } className="help-center__container-content-wrapper">
				<Routes>
					<Route
						path="/"
						element={
							navigateToRoute ? (
								<Navigate to={ navigateToRoute } />
							) : (
								<HelpCenterSearch onSearchChange={ setSearchTerm } currentRoute={ currentRoute } />
							)
						}
					/>
					<Route path="/post" element={ <HelpCenterArticle /> } />
					<Route path="/contact-options" element={ <HelpCenterContactPage /> } />
					<Route
						path="/contact-form"
						element={ <HelpCenterContactForm onSubmit={ () => setOdieStorage( null ) } /> }
					/>
					<Route path="/success" element={ <SuccessScreen /> } />
					<Route
						path="/odie"
						element={
							<HelpCenterMessenger>
								<OdieAssistantProvider
									botNameSlug="wpcom-support-chat"
									botName="Wapuu"
									enabled={ shouldUseWapuu }
									currentUser={ currentUser }
									isMinimized={ isMinimized }
									initialUserMessage={ searchTerm }
									logger={ trackEvent }
									loggerEventNamePrefix="calypso_odie"
									selectedSiteId={ site?.ID as number }
									navigateToContactOptions={ navigateToContactOptions }
									navigateToSupportDocs={ navigateToSupportDocs }
								>
									<HelpCenterOdie />
								</OdieAssistantProvider>
							</HelpCenterMessenger>
						}
					/>
				</Routes>
			</Wrapper>
		</CardBody>
	);
};

export default HelpCenterContent;
