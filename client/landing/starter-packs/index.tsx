import '@automattic/calypso-polyfills';
import { CurrentUser } from '@automattic/data-stores';
import ReactDom from 'react-dom';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { filterUserObject } from 'calypso/lib/user/shared-utils/filter-user-object';
import { FediConnectionProvider } from './components/fedi-connection-context';
import Layout from './components/layout';
import PackDetail from './components/pack-detail';
import PackDirectory from './components/pack-directory';
import { WpcomUserProvider } from './components/wpcom-user-context';

import './styles/styles.scss';

function App( { user }: { user: CurrentUser | null } ) {
	return (
		<BrowserRouter>
			<WpcomUserProvider user={ user }>
				<FediConnectionProvider>
					<Layout>
						<Routes>
							<Route path="/starter-packs/:slug" element={ <PackDetail /> } />
							<Route path="/starter-packs" element={ <PackDirectory /> } />
						</Routes>
					</Layout>
				</FediConnectionProvider>
			</WpcomUserProvider>
		</BrowserRouter>
	);
}

function boot() {
	// Use the server-bootstrapped user data directly. Avoids calling rawCurrentUserFetch()
	// which hangs when wpcom-user-bootstrap is disabled (local dev, logged-out users).
	const userData = window.currentUser ? filterUserObject( window.currentUser ) : null;
	const user = userData ? ( userData as unknown as CurrentUser ) : null;

	ReactDom.render( <App user={ user } />, document.getElementById( 'wpcom' ) );
}

boot();
