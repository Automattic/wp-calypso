/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { render, screen } from '@testing-library/react';
import PluginDetailsHeader from 'calypso/my-sites/plugins/plugin-details-header';

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn(),
} ) );

jest.mock( '@automattic/calypso-config', () => {
	const fn = jest.fn();
	fn.isEnabled = jest.fn();
	return fn;
} );

const plugin = {
	name: 'Yoast SEO Premium',
	slug: 'wordpress-seo-premium',
	author_name: 'Team Yoast',
	author_profile: 'https://profiles.wordpress.org/yoast/',
};

describe( 'PluginDetailsHeader', () => {
	const mockedProps = {
		isJetpackCloud: false,
		isPlaceholder: false,
		plugin,
	};
	// configEnabled mocks whether plugins/plugin-details-layout feature is enabled.
	test.each( [ { configEnabled: true }, { configEnabled: false } ] )(
		'should render the correct author url (configEnabled: $configEnabled)',
		( { configEnabled } ) => {
			config.isEnabled.mockImplementation( () => configEnabled );
			render( <PluginDetailsHeader { ...mockedProps } /> );
			const want = /\/plugins\/.*\?s=developer:.*/;
			const have = screen.getByText( plugin.author_name ).getAttribute( 'href' );
			expect( have ).toMatch( want );
		}
	);
} );
