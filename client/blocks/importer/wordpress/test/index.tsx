/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { WordpressImporter } from '..';

jest.mock( 'calypso/state', () => ( {
	useSelector: ( selector: ( state: object ) => unknown ) => selector( {} ),
} ) );

jest.mock( 'calypso/state/selectors/is-site-automated-transfer', () => jest.fn() );

jest.mock( 'calypso/state/sites/selectors', () => ( {
	getSite: () => ( { ID: 123 } ),
	isJetpackSite: jest.fn(),
} ) );

jest.mock( 'calypso/state/imports/url-analyzer/selectors', () => ( {
	getUrlData: () => null,
} ) );

jest.mock( '../import-content-only', () => () => <div>Import content</div> );

describe( 'WordpressImporter', () => {
	beforeEach( () => {
		jest.mocked( isSiteAutomatedTransfer ).mockReturnValue( true );
		jest.mocked( isJetpackSite ).mockReturnValue( false );
	} );

	it( 'renders without waiting for the complete sites list', () => {
		render(
			<WordpressImporter siteId={ 123 } siteSlug="example.wordpress.com" renderHeading={ false } />
		);

		expect( screen.getByText( 'Import content' ) ).toBeVisible();
	} );

	it( 'does not render punctuation next to the loading indicator', () => {
		jest.mocked( isSiteAutomatedTransfer ).mockReturnValue( false );
		jest.mocked( isJetpackSite ).mockReturnValue( true );

		const { container } = render(
			<WordpressImporter siteId={ 123 } siteSlug="example.wordpress.com" renderHeading={ false } />
		);

		expect( container.querySelector( '.wpcom__loading-ellipsis' ) ).toBeInTheDocument();
		expect( container ).not.toHaveTextContent( ';' );
	} );
} );
