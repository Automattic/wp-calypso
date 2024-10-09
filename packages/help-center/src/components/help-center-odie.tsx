/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import OdieAssistantProvider, { OdieAssistant, isOdieAllowedBot } from '@automattic/odie-client';
import { useSelect } from '@wordpress/data';
import React, { useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useShouldUseWapuu } from '../hooks';
import { HELP_CENTER_STORE } from '../stores';
/**
 * Internal Dependencies
 */
import { ExtraContactOptions } from './help-center-extra-contact-option';
import './help-center-odie.scss';
import type { HelpCenterSelect } from '@automattic/data-stores';
import type { OdieAllowedBots } from '@automattic/odie-client/src/types/index';

interface ProtectedRouteProps {
	condition: boolean;
	redirectPath?: string;
	children: React.ReactNode;
}

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

export function HelpCenterOdie( {
	isLoadingEnvironment,
	isUserEligible,
	searchTerm,
}: {
	isLoadingEnvironment: boolean;
	isUserEligible: boolean;
	searchTerm: string;
} ): JSX.Element {
	const navigate = useNavigate();
	const shouldUseWapuu = useShouldUseWapuu();
	const preventOdieAccess = ! shouldUseWapuu && ! isUserEligible;
	const { currentUser, site } = useHelpCenterContext();

	const { odieInitialPromptText, odieBotNameSlug, isMinimized } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;

		const odieBotNameSlug = isOdieAllowedBot( store.getOdieBotNameSlug() )
			? store.getOdieBotNameSlug()
			: 'wpcom-support-chat';

		return {
			odieInitialPromptText: store.getOdieInitialPromptText(),
			odieBotNameSlug: odieBotNameSlug as OdieAllowedBots,
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

	const navigateToContactOptions = useCallback( () => {
		if ( isUserEligible ) {
			navigate( '/contact-options' );
		} else {
			navigate( '/contact-form?mode=FORUM' );
		}
	}, [ navigate, isUserEligible ] );

	const trackEvent = useCallback(
		( eventName: string, properties: Record< string, unknown > = {} ) => {
			recordTracksEvent( eventName, properties );
		},
		[]
	);

	return (
		<ProtectedRoute condition={ preventOdieAccess }>
			<OdieAssistantProvider
				isLoadingEnvironment={ isLoadingEnvironment }
				botNameSlug={ odieBotNameSlug }
				botName="Wapuu"
				odieInitialPromptText={ odieInitialPromptText }
				currentUser={ currentUser }
				isMinimized={ isMinimized }
				initialUserMessage={ searchTerm }
				logger={ trackEvent }
				loggerEventNamePrefix="calypso_odie"
				selectedSiteId={ site?.ID as number }
				extraContactOptions={ <ExtraContactOptions isUserEligible={ isUserEligible } /> }
				navigateToContactOptions={ navigateToContactOptions }
				navigateToSupportDocs={ navigateToSupportDocs }
				isUserEligible={ isUserEligible }
			>
				<div className="help-center__container-content-odie">
					<OdieAssistant />
				</div>
			</OdieAssistantProvider>
		</ProtectedRoute>
	);
}
