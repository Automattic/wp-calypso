/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { identity } from 'lodash';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */

import { HelpSearch } from '../';

const defaultProps = {
	translate: identity,
};

const helpLinks = {
	wordpress_forum_links_localized: [
		{
			description: 'bacon',
			link: 'apple',
			title: 'pancake',
		},
	],
	wordpress_forum_links: [
		{
			description: 'walnut',
			link: 'apricot',
			title: 'cream',
		},
	],
};

const searchQuery = 'maplesyrup';

describe( 'HelpSearch', () => {
	test( 'should render ', () => {
		const wrapper = shallow( <HelpSearch { ...defaultProps } /> );
		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'should prioritize and pass localized forum search results if available ', () => {
		const wrapper = shallow( <HelpSearch { ...defaultProps } helpLinks={ helpLinks } /> );
		wrapper.setState( { searchQuery } );
		wrapper.update();
		const HelpResultsElements = wrapper.find( 'HelpResults' );
		expect( HelpResultsElements ).toHaveLength( 3 );
		expect( HelpResultsElements.at( 1 ).props().helpLinks ).toEqual(
			helpLinks.wordpress_forum_links_localized
		);
	} );

	test( 'should display `en` forum search results localized not available', () => {
		const wrapper = shallow(
			<HelpSearch
				{ ...defaultProps }
				helpLinks={ { wordpress_forum_links: helpLinks.wordpress_forum_links } }
			/>
		);
		wrapper.setState( { searchQuery } );
		wrapper.update();
		const HelpResultsElements = wrapper.find( 'HelpResults' );
		expect( HelpResultsElements ).toHaveLength( 3 );
		expect( HelpResultsElements.at( 1 ).props().helpLinks ).toEqual(
			helpLinks.wordpress_forum_links
		);
	} );
} );
