/**
 * External dependencies
 */

import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { PeopleListItem } from '..';
import CompactCard from 'components/card/compact';

describe( 'PeopleListItem', function() {
	it( 'renders CompactCard', function() {
		const wrapper = shallow( <PeopleListItem /> );

		expect( wrapper.find( CompactCard ).length ).to.equal( 1 );
		expect( wrapper.find( CompactCard ).props().className ).to.equal( 'people-list-item' );
	} );
} );
