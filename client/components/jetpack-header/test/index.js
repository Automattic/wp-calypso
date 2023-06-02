/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { JetpackHeader } from '..';

jest.mock( 'calypso/components/jetpack-logo', () => ( { size } ) => (
	<div data-testid="jetpack-logo">
		<div data-testid="jetpack-logo-size">{ size }</div>
	</div>
) );
jest.mock( '../partner-logo-group', () => ( { width } ) => (
	<div data-testid="jetpack-partner-logo-group">
		<div data-testid="jetpack-partner-logo-group-size">{ width }</div>
	</div>
) );

describe( 'JetpackHeader', () => {
	test( 'renders default Jetpack logo when no partnerSlug prop', () => {
		render( <JetpackHeader /> );
		expect( screen.queryByTestId( 'jetpack-logo' ) ).toBeVisible();
		expect( screen.queryByTestId( 'jetpack-logo-size' ) ).toHaveTextContent( '45' );
	} );

	test( 'should render default Jetpack logo when passed empty string for partnerSlug prop', () => {
		render( <JetpackHeader partnerSlug="" /> );
		expect( screen.queryByTestId( 'jetpack-logo' ) ).toBeVisible();
		expect( screen.queryByTestId( 'jetpack-logo-size' ) ).toHaveTextContent( '45' );
	} );

	test( 'should render JetpackLogo when passed an unknown partner slug', () => {
		render( <JetpackHeader partnerSlug="nonexistent" /> );
		expect( screen.queryByTestId( 'jetpack-logo' ) ).toBeVisible();
		expect( screen.queryByTestId( 'jetpack-logo-size' ) ).toHaveTextContent( '45' );
	} );

	test( 'should render a co-branded logo when passed a known partner slug', () => {
		render( <JetpackHeader partnerSlug="dreamhost" /> );
		expect( screen.queryByTestId( 'jetpack-partner-logo-group' ) ).toBeVisible();
	} );

	test( 'should override width on JetpackLogo when width provided but no partner slug', () => {
		render( <JetpackHeader width={ 60 } /> );
		expect( screen.queryByTestId( 'jetpack-logo' ) ).toBeVisible();
		expect( screen.queryByTestId( 'jetpack-logo-size' ) ).toHaveTextContent( '60' );
	} );

	test( 'should override width on logo group when width and known partner slug provided', () => {
		render( <JetpackHeader width={ 60 } partnerSlug="dreamhost" /> );
		expect( screen.queryByTestId( 'jetpack-partner-logo-group' ) ).toBeVisible();
		expect( screen.queryByTestId( 'jetpack-partner-logo-group-size' ) ).toHaveTextContent( '60' );
	} );
} );
