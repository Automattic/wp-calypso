import '@automattic/calypso-color-schemes';
import '@wordpress/components/build-style/style.css';
import './styles.scss';
import { initialize as initializeMSW, mswLoader } from 'msw-storybook-addon';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import plansFixtures from '../src/fixtures/plans';
import sitesPlansFixtures from '../src/fixtures/sites-plans';
import sitesPurchasesFixtures from '../src/fixtures/sites-purchases';
import { http, HttpResponse } from 'msw';

window.__i18n_text_domain__ = 'default';

const queryClient = new QueryClient();

initializeMSW( { onUnhandledRequest: 'bypass' } );

const respond = ( body ) => {
	return HttpResponse.json( {
		code: 200,
		headers: [ { name: 'Content-Type', value: 'application/json' } ],
		body,
	} );
};

const config = {
	loaders: [ mswLoader ],
	decorators: [
		( Story ) => (
			<QueryClientProvider client={ queryClient }>
				<Story />
			</QueryClientProvider>
		),
	],
	parameters: {
		msw: {
			handlers: [
				http.get( '/plans', () => respond( plansFixtures ) ),
				http.get( `/sites/*/plans`, () => respond( sitesPlansFixtures ) ),
				http.get( `/sites/*/purchases`, () => respond( sitesPurchasesFixtures ) ),
			],
		},
	},
};

export default config;
