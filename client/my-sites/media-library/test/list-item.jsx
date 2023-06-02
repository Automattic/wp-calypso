/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import ListItem from 'calypso/my-sites/media-library/list-item';
import fixtures from './fixtures';

jest.mock( 'calypso/my-sites/media-library/media-file', () => () => null );

describe( 'MediaLibraryListItem > selectedIndex', () => {
	test( 'when selectedIndex is over 99 it gets capped', () => {
		render( <ListItem media={ fixtures.media[ 0 ] } scale={ 1 } selectedIndex={ 99 } /> );
		expect( screen.getByRole( 'button' ) ).toHaveAttribute( 'data-selected-number', '99+' );
	} );

	test( 'when selectedIndex is under 100 it is as shown', () => {
		render( <ListItem media={ fixtures.media[ 0 ] } scale={ 1 } selectedIndex={ 98 } /> );
		expect( screen.getByRole( 'button' ) ).toHaveAttribute( 'data-selected-number', '99' );
	} );
} );
