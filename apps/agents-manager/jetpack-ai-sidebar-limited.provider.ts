import {
	capabilities as sharedCapabilities,
	contextProvider,
	getChatComponent,
	getEmptyViewSuggestions,
	registerBlockEditorFilters,
	useAbilitiesSetup,
	useCheckpoint,
	useSubmissionAdmission,
	jetpackAiClientStateDataPartAdapter,
	useWritingOnlySuggestions,
	writingOnlyToolProvider,
} from '@automattic/jetpack-ai-sidebar';

function loadProviderStyles(): void {
	if ( typeof document === 'undefined' ) {
		return;
	}

	const id = 'jetpack-ai-sidebar-limited-provider-styles';
	if ( document.getElementById( id ) ) {
		return;
	}

	const providerUrl = agentsManagerData?.jetpackAiWritingProviderUrl;
	if ( typeof providerUrl !== 'string' || ! providerUrl ) {
		return;
	}

	let stylesheetUrl: URL;
	try {
		stylesheetUrl = new URL( providerUrl, window.location.href );
	} catch {
		return;
	}

	if ( ! /\.mjs$/.test( stylesheetUrl.pathname ) ) {
		return;
	}

	const isRtl = document.documentElement.dir.toLowerCase() === 'rtl';
	stylesheetUrl.pathname = stylesheetUrl.pathname.replace( /\.mjs$/, isRtl ? '.rtl.css' : '.css' );
	stylesheetUrl.hash = '';

	const link = document.createElement( 'link' );
	link.id = id;
	link.rel = 'stylesheet';
	link.href = stylesheetUrl.href;
	document.head.appendChild( link );
}

loadProviderStyles();
registerBlockEditorFilters();

export const providerId = 'jetpack-ai-sidebar-limited';
export const toolProvider = writingOnlyToolProvider;
export { contextProvider };
export { getChatComponent };
export { getEmptyViewSuggestions };
export { useWritingOnlySuggestions as useSuggestions };
export { useAbilitiesSetup };
export { useCheckpoint };
export { useSubmissionAdmission };
export const clientStateDataPartAdapter = jetpackAiClientStateDataPartAdapter;
export const capabilities = { ...sharedCapabilities, supportsSplitScreen: false };
