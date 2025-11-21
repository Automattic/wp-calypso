/**
 * Help Center AI Assistant Component
 *
 * Conditionally renders either the new unified agent (UnifiedAIAgent)
 * or the legacy HelpCenterGPT based on feature flag.
 */

import UnifiedAIAgent from '@automattic/ai-manager';
import { useCallback } from '@wordpress/element';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useShouldUseUnifiedAgent } from '../hooks';
import { HelpCenterGPT } from './help-center-gpt';
import type { JetpackSearchAIResult } from '../data/use-jetpack-search-ai';
import type { SearchResult } from '../types';

interface HelpCenterAIAssistantProps {
	onResponseReceived: ( response: JetpackSearchAIResult ) => void;
	redirectToArticle: (
		event: React.MouseEvent< HTMLAnchorElement, MouseEvent >,
		result: SearchResult
	) => void;
}

export function HelpCenterAIAssistant( {
	onResponseReceived,
	redirectToArticle,
}: HelpCenterAIAssistantProps ) {
	const shouldUseUnifiedAgent = useShouldUseUnifiedAgent();
	const { currentUser, site, sectionName } = useHelpCenterContext();

	// Save/load preferences using wpcom-proxy-request
	const savePreference = useCallback( async ( key: string, value: unknown ) => {
		if ( canAccessWpcomApis() ) {
			try {
				await wpcomRequest( {
					path: '/me/preferences',
					apiNamespace: 'wpcom/v2',
					method: 'PUT',
					body: {
						calypso_preferences: {
							[ key ]: value,
						},
					},
				} );
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.warn( '[HelpCenterAIAssistant] Failed to save preferences:', error );
			}
		}
	}, [] );

	const loadPreference = useCallback( async ( key: string ) => {
		if ( canAccessWpcomApis() ) {
			try {
				const response = await wpcomRequest< {
					calypso_preferences?: Record< string, unknown >;
				} >( {
					path: '/me/preferences',
					apiNamespace: 'wpcom/v2',
					method: 'GET',
				} );
				return response?.calypso_preferences?.[ key ] || null;
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.warn( '[HelpCenterAIAssistant] Failed to load preferences:', error );
			}
		}
		return null;
	}, [] );

	// Use unified agent if feature flag is enabled
	if ( shouldUseUnifiedAgent ) {
		return (
			<UnifiedAIAgent
				containerSelector=".help-center"
				currentUser={ currentUser }
				site={ site }
				sectionName={ sectionName }
				savePreference={ savePreference }
				loadPreference={ loadPreference }
			/>
		);
	}

	// Fall back to legacy HelpCenterGPT
	return (
		<HelpCenterGPT
			onResponseReceived={ onResponseReceived }
			redirectToArticle={ redirectToArticle }
		/>
	);
}
