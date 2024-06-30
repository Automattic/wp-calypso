/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import OdieAssistantProvider, { useSetOdieStorage } from '@automattic/odie-client';
import { CardBody, Disabled } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import React, { useCallback, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
/**
 * Internal Dependencies
 */
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useShouldUseWapuu } from '../hooks';
import { HELP_CENTER_STORE } from '../stores';
import { HelpCenterContactForm } from './help-center-contact-form';
import { HelpCenterContactPage } from './help-center-contact-page';
import { HelpCenterEmbedResult } from './help-center-embed-result';
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
	const navigate = useNavigate();
	const containerRef = useRef< HTMLDivElement >( null );

	const { sectionName, currentUser, site } = useHelpCenterContext();
	const shouldUseWapuu = useShouldUseWapuu();
	const { isMinimized } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			isMinimized: store.getIsMinimized(),
		};
	}, [] );

	useEffect( () => {
		recordTracksEvent( 'calypso_helpcenter_page_open', {
			pathname: location.pathname,
			search: location.search,
			section: sectionName,
			force_site_id: true,
			location: 'help-center',
		} );
	}, [ location, sectionName ] );

	const { initialRoute } = useSelect(
		( select ) => ( {
			initialRoute: ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getInitialRoute(),
		} ),
		[]
	);

	useEffect( () => {
		if ( initialRoute ) {
			navigate( initialRoute );
		}
	}, [ initialRoute ] );

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

	return (
		<CardBody ref={ containerRef } className="help-center__container-content">
			<Wrapper isDisabled={ isMinimized } className="help-center__container-content-wrapper">
				<Routes>
					<Route
						path="/"
						element={
							<HelpCenterSearch onSearchChange={ setSearchTerm } currentRoute={ currentRoute } />
						}
					/>
					<Route path="/post" element={ <HelpCenterEmbedResult /> } />
					<Route path="/contact-options" element={ <HelpCenterContactPage /> } />
					<Route
						path="/contact-form"
						element={ <HelpCenterContactForm onSubmit={ () => setOdieStorage( null ) } /> }
					/>
					<Route path="/success" element={ <SuccessScreen /> } />
					<Route
						path="/odie"
						element={
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
								extraContactOptions={
									<HelpCenterContactPage
										hideHeaders
										trackEventName="calypso_odie_extra_contact_option"
									/>
								}
							>
								<HelpCenterOdie />
							</OdieAssistantProvider>
						}
					/>
				</Routes>
			</Wrapper>
		</CardBody>
	);
};

export default HelpCenterContent;
