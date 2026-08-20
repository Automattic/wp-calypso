/* global agentsManagerData */
import { discardCurrentAgentsManagerAgent } from '@automattic/agents-manager/src/utils/discard-current-agent';
import { useJetpackAiSidebarVisibility } from '@automattic/jetpack-ai-sidebar/src/utils/page-editor-eligibility';
import { Fragment, useLayoutEffect, useMemo, useRef } from '@wordpress/element';
import './jetpack-ai-sidebar-page-gate.scss';

export const JETPACK_AI_SIDEBAR_HIDDEN_CLASS = 'jetpack-ai-sidebar-page-ineligible';
const JETPACK_AI_SIDEBAR_PROVIDER_FILE = 'jetpack-ai-sidebar.provider.mjs';
const JETPACK_AI_SIDEBAR_PROVIDER_ID = 'jetpack-ai-sidebar';

function isJetpackAiSidebarProvider( provider ) {
	return (
		( typeof provider === 'string' && provider.includes( JETPACK_AI_SIDEBAR_PROVIDER_FILE ) ) ||
		( provider &&
			typeof provider === 'object' &&
			provider.providerId === JETPACK_AI_SIDEBAR_PROVIDER_ID )
	);
}

export default function JetpackAiSidebarPageGate( { children } ) {
	const { isPageOnly, isVisible } = useJetpackAiSidebarVisibility();
	const data = typeof agentsManagerData !== 'undefined' ? agentsManagerData : undefined;
	const originalProviders = useRef(
		Array.isArray( data?.agentProviders ) ? [ ...data.agentProviders ] : null
	).current;
	const hasJetpackAiSidebarProvider =
		originalProviders?.some( isJetpackAiSidebarProvider ) === true;
	const hasAnotherProvider =
		originalProviders?.some( ( provider ) => ! isJetpackAiSidebarProvider( provider ) ) === true;
	const shouldFilterJetpackProvider = isPageOnly && ! isVisible && hasJetpackAiSidebarProvider;
	const activeProviders = useMemo(
		() =>
			shouldFilterJetpackProvider
				? originalProviders.filter( ( provider ) => ! isJetpackAiSidebarProvider( provider ) )
				: originalProviders,
		[ originalProviders, shouldFilterJetpackProvider ]
	);
	const shouldMountAgentsManager =
		! isPageOnly || isVisible || ! hasJetpackAiSidebarProvider || hasAnotherProvider;
	const shouldHideEntryPoints =
		isPageOnly && ! isVisible && hasJetpackAiSidebarProvider && ! hasAnotherProvider;
	const latestShouldFilterJetpackProvider = useRef( shouldFilterJetpackProvider );
	latestShouldFilterJetpackProvider.current = shouldFilterJetpackProvider;

	// Agenttic captures provider configuration when it creates the live client. Discard during the
	// old layout cleanup, before the keyed child's next layout setup clears the resolved agent ID.
	useLayoutEffect( () => {
		const mountedShouldFilterJetpackProvider = shouldFilterJetpackProvider;

		return () => {
			if ( latestShouldFilterJetpackProvider.current !== mountedShouldFilterJetpackProvider ) {
				discardCurrentAgentsManagerAgent();
			}
		};
	}, [ shouldFilterJetpackProvider ] );

	// AgentSetup loads external providers in a passive effect. A layout effect updates the global
	// first without introducing a render-phase side effect.
	useLayoutEffect( () => {
		if ( data && activeProviders && isPageOnly && hasJetpackAiSidebarProvider ) {
			data.agentProviders = activeProviders;
		}
		document.body.classList.toggle( JETPACK_AI_SIDEBAR_HIDDEN_CLASS, shouldHideEntryPoints );

		return () => {
			if ( data && originalProviders && isPageOnly && hasJetpackAiSidebarProvider ) {
				data.agentProviders = originalProviders;
			}
			document.body.classList.remove( JETPACK_AI_SIDEBAR_HIDDEN_CLASS );
		};
	}, [
		activeProviders,
		data,
		hasJetpackAiSidebarProvider,
		isPageOnly,
		originalProviders,
		shouldHideEntryPoints,
	] );

	return shouldMountAgentsManager ? (
		<Fragment key={ shouldFilterJetpackProvider ? 'without-jetpack-ai' : 'with-jetpack-ai' }>
			{ children }
		</Fragment>
	) : null;
}
