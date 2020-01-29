let fetchPluginsListCalls = 0;
let lastRequestParams = null;

let deactivatedCallbacks = false;
let mockedNumberOfReturnedPages = 10;

export function setInternalState( state ) {
	if ( state.mockedNumberOfReturnedPages !== undefined ) {
		mockedNumberOfReturnedPages = state.mockedNumberOfReturnedPages;
	}

	if ( state.deactivatedCallbacks !== undefined ) {
		deactivatedCallbacks = state.deactivatedCallbacks;
	}
}

export function reset() {
	fetchPluginsListCalls = 0;
	mockedNumberOfReturnedPages = 10;
	deactivatedCallbacks = false;
	lastRequestParams = null;
}

export function getActivity() {
	return {
		fetchPluginsList: fetchPluginsListCalls,
		lastRequestParams: lastRequestParams,
	};
}

export function fetchPluginsList( options, callback ) {
	fetchPluginsListCalls++;
	lastRequestParams = options;
	if ( ! deactivatedCallbacks ) {
		callback( null, {
			plugins: [],
			info: { pages: mockedNumberOfReturnedPages },
		} );
	}
}
