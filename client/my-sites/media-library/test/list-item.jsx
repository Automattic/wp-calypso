/**
 * @jest-environment jsdom
 */

import { expect } from 'chai';
import { shallow } from 'enzyme';
import ListItem from 'calypso/my-sites/media-library/list-item';
import fixtures from './fixtures';

describe( 'MediaLibraryListItem', () => {
	let wrapper;

	beforeEach( () => {
		if ( wrapper ) {
			wrapper.unmount();
		}
	} );

	describe( 'selectedIndex', () => {
		test( 'when selectedIndex is over 99 it gets capped', () => {
			wrapper = shallow(
				<ListItem media={ fixtures.media[ 0 ] } scale={ 1 } selectedIndex={ 99 } />
			);

			expect( wrapper.props()[ 'data-selected-number' ] ).to.be.equal( '99+' );
		} );
		test( 'when selectedIndex is under 100 it is as shown', () => {
			wrapper = shallow(
				<ListItem media={ fixtures.media[ 0 ] } scale={ 1 } selectedIndex={ 98 } />
			);

			expect( wrapper.props()[ 'data-selected-number' ] ).to.be.equal( 99 );
		} );
	} );
} );
