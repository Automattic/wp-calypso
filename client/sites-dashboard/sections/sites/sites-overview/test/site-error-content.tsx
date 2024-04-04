/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import SiteErrorContent from '../site-error-content';

describe( '<SiteErrorContent>', () => {
	const siteUrl = 'test.jurassic.ninja';

	const initialState = {};
	const mockStore = configureStore();
	const store = mockStore( initialState );

	const { container } = render(
		<Provider store={ store }>
			<SiteErrorContent siteUrl={ siteUrl } />
		</Provider>
	);

	test( 'should render correctly and have href for Fix Now', () => {
		const [ fixNow ] = container.getElementsByClassName( 'sites-overview__error-message-link' );
		expect( fixNow ).toHaveProperty(
			'href',
			`https://example.com/settings/disconnect-site/${ urlToSlug( siteUrl ) }?type=down`
		);
	} );
} );
