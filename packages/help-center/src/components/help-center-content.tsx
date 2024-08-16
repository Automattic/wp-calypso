/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import OdieAssistantProvider, {
	isOdieAllowedBot,
	useSetOdieStorage,
} from '@automattic/odie-client';
import { CardBody, Disabled } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import React, { useCallback, useState } from 'react';
import { Route, Routes, useLocation, useNavigate, Navigate } from 'react-router-dom';
/**
 * Internal Dependencies
 */
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useSupportStatus } from '../data/use-support-status';
import { useChatStatus, useShouldRenderEmailOption, useShouldUseWapuu } from '../hooks';
import { HELP_CENTER_STORE } from '../stores';
import { HelpCenterArticle } from './help-center-article';
import { HelpCenterContactForm } from './help-center-contact-form';
import { HelpCenterContactPage } from './help-center-contact-page';
import { ExtraContactOptions } from './help-center-extra-contact-option';
import { HelpCenterOdie } from './help-center-odie';
import { HelpCenterSearch } from './help-center-search';
import { SuccessScreen } from './ticket-success-screen';
import type { HelpCenterSelect } from '@automattic/data-stores';
import type { OdieAllowedBots } from '@automattic/odie-client/src/types/index';

interface ProtectedRouteProps {
	condition: boolean;
	redirectPath?: string;
	children: React.ReactNode;
}

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
	const { isLoading: isLoadingEmailStatus } = useShouldRenderEmailOption();
	const { isLoading: isLoadingChatStatus } = useChatStatus();
	const isLoadingEnvironment = isLoadingEmailStatus || isLoadingChatStatus;
	const shouldUseWapuu = useShouldUseWapuu();
	const { isMinimized, odieInitialPromptText, odieBotNameSlug } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;

		const odieBotNameSlug = isOdieAllowedBot( store.getOdieBotNameSlug() )
			? ( store.getOdieBotNameSlug() as OdieAllowedBots )
			: 'wpcom-support-chat';

		return {
			isMinimized: store.getIsMinimized(),
			odieInitialPromptText: store.getOdieInitialPromptText(),
			odieBotNameSlug,
		};
	}, [] );

	const { data } = useSupportStatus();

	const isUserElegible = data?.eligibility.is_user_eligible ?? false;
	const preventOdieAccess = ! shouldUseWapuu && ! isUserElegible && ! isLoadingEnvironment;

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
			is_free_user: ! isUserElegible,
		} );
	}, [ location, sectionName, isUserElegible ] );

	const { navigateToRoute } = useSelect(
		( select ) => ( {
			navigateToRoute: ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getNavigateToRoute(),
		} ),
		[]
	);

	useEffect( () => {
		if ( navigateToRoute ) {
			const fullLocation = [ location.pathname, location.search, location.hash ].join( '' );
			// On navigate once to keep the back button responsive.
			if ( fullLocation !== navigateToRoute ) {
				navigate( navigateToRoute );
			}
			setNavigateToRoute( null );
		}
	}, [ navigate, navigateToRoute, setNavigateToRoute, location ] );

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
		if ( isUserElegible ) {
			navigate( '/contact-options' );
		} else {
			navigate( '/contact-form?mode=FORUM' );
		}
	}, [ navigate, isUserElegible ] );

	// Prevent not eligible users from accessing odie/wapuu.
	const ProtectedRoute: React.FC< ProtectedRouteProps > = ( {
		condition,
		redirectPath = '/',
		children,
	} ) => {
		if ( condition ) {
			// redirect users home if they are not eligible for chat
			recordTracksEvent( 'calypso_helpcenter_redirect_not_eligible_user_to_homepage', {
				pathname: window.location.pathname,
				search: window.location.search,
			} );
			return <Navigate to={ redirectPath } replace />;
		}
		return children;
	};
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
							<ProtectedRoute condition={ preventOdieAccess }>
								<OdieAssistantProvider
									isLoadingEnvironment={ isLoadingEnvironment }
									botNameSlug={ odieBotNameSlug }
									botName="Wapuu"
									odieInitialPromptText={ odieInitialPromptText }
									enabled={ shouldUseWapuu }
									currentUser={ currentUser }
									isMinimized={ isMinimized }
									initialUserMessage={ searchTerm }
									logger={ trackEvent }
									loggerEventNamePrefix="calypso_odie"
									selectedSiteId={ site?.ID as number }
									extraContactOptions={ <ExtraContactOptions isUserElegible={ isUserElegible } /> }
									navigateToContactOptions={ navigateToContactOptions }
									navigateToSupportDocs={ navigateToSupportDocs }
									isUserElegible={ isUserElegible }
								>
									<HelpCenterOdie />
								</OdieAssistantProvider>
							</ProtectedRoute>
						}
					/>
				</Routes>
			</Wrapper>
		</CardBody>
	);
};

export default HelpCenterContent;
