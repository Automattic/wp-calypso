/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import MediaLibraryDataSource from 'calypso/my-sites/media-library/data-source';
import { createReduxStore } from 'calypso/state';
import { setStore } from 'calypso/state/redux-store';

const noop = () => {};

// we need to check the correct children are rendered, so this mocks the
// PopoverMenu component with one that simply renders the children
jest.mock( 'calypso/components/popover-menu', () => {
	return ( { children } ) => <div>{ children }</div>;
} );
// only enable the external-media options, enabling everything causes an
// electron related build error
jest.mock( '@automattic/calypso-config', () => {
	const config = () => 'development';
	config.isEnabled = jest.fn();
	return config;
} );

describe( 'MediaLibraryDataSource', () => {
	describe( 'render data sources', () => {
		test( 'does not exclude any data sources by default', () => {
			const store = createReduxStore();
			setStore( store );
			render(
				<ReduxProvider store={ store }>
					<MediaLibraryDataSource source="" onSourceChange={ noop } ignorePermissions />
				</ReduxProvider>
			);

			expect( screen.getByText( 'Google Photos' ) ).toBeVisible();
			expect( screen.getByText( 'Pexels free photos' ) ).toBeVisible();
		} );

		test( 'excludes data sources listed in disabledSources', () => {
			const store = createReduxStore();
			setStore( store );
			render(
				<ReduxProvider store={ store }>
					<MediaLibraryDataSource
						source=""
						onSourceChange={ noop }
						disabledSources={ [ 'pexels' ] }
						ignorePermissions
					/>
				</ReduxProvider>
			);
			expect( screen.getByText( 'Google Photos' ) ).toBeVisible();
			expect( screen.queryByText( 'Pexels free photos' ) ).not.toBeInTheDocument();
		} );
	} );
} );
