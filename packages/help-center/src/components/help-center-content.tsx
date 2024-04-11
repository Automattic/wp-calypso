/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import OdieAssistantProvider, { clearOdieStorage } from '@automattic/odie-client';
import { CardBody } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { getSectionName, getSelectedSiteId } from 'calypso/state/ui/selectors';
/**
 * Internal Dependencies
 */
import { useIsWapuuEnabled } from '../hooks';
import { HELP_CENTER_STORE } from '../stores';
import { HelpCenterContactForm } from './help-center-contact-form';
import { HelpCenterContactPage } from './help-center-contact-page';
import { HelpCenterEmbedResult } from './help-center-embed-result';
import { HelpCenterOdie } from './help-center-odie';
import { HelpCenterSearch } from './help-center-search';
import { SuccessScreen } from './ticket-success-screen';
import type { HelpCenterSelect } from '@automattic/data-stores';

const HelpCenterContent: React.FC< { isRelative?: boolean; currentRoute?: string } > = ( {
	currentRoute,
} ) => {
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const location = useLocation();
	const navigate = useNavigate();
	const containerRef = useRef< HTMLDivElement >( null );
	const section = useSelector( getSectionName );
	const isWapuuEnabled = useIsWapuuEnabled();
	const { isMinimized } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			isMinimized: store.getIsMinimized(),
		};
	}, [] );
	const selectedSiteId = useSelector( getSelectedSiteId );

	useEffect( () => {
		recordTracksEvent( 'calypso_helpcenter_page_open', {
			pathname: location.pathname,
			search: location.search,
			section,
			force_site_id: true,
			location: 'help-center',
		} );
	}, [ location, section ] );

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

	return (
		<CardBody ref={ containerRef } className="help-center__container-content">
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
					element={ <HelpCenterContactForm onSubmit={ () => clearOdieStorage( 'chat_id' ) } /> }
				/>
				<Route path="/success" element={ <SuccessScreen /> } />
				<Route
					path="/odie"
					element={
						<OdieAssistantProvider
							botNameSlug="wpcom-support-chat"
							botName="Wapuu"
							enabled={ isWapuuEnabled }
							isMinimized={ isMinimized }
							initialUserMessage={ searchTerm }
							logger={ trackEvent }
							loggerEventNamePrefix="calypso_odie"
							selectedSiteId={ selectedSiteId }
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
		</CardBody>
	);
};

export default HelpCenterContent;
