import { createContext, FunctionComponent } from 'react';
import QueryAsyncToast from 'calypso/components/data/query-async-toast';
import { useSelector } from 'calypso/state';
import { getAsyncToast } from 'calypso/state/async-toast/selectors';
import { AsyncToastState } from 'calypso/state/async-toast/types';
import { SiteId } from 'calypso/types';

const AsyncToastContext = createContext< AsyncToastState >( {
	isStale: true,
	isRequesting: false,
	data: {},
} );

interface Props {
	selectedSiteId: SiteId;
	children?: React.ReactNode;
}

const AsyncToastProvider: FunctionComponent< Props > = ( { children, selectedSiteId } ) => {
	const toasts = useSelector( ( state ) => getAsyncToast( state ) );

	return (
		<>
			{ selectedSiteId && <QueryAsyncToast siteId={ selectedSiteId } /> }
			<AsyncToastContext.Provider value={ toasts }>{ children }</AsyncToastContext.Provider>
		</>
	);
};

export { AsyncToastContext, AsyncToastProvider };
