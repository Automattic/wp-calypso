/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import request from 'superagent';

/**
 * Internal dependencies
 */
import GutenbergComponentExample from '../example';

jest.mock( 'superagent', () => ( {
	get: jest.fn().mockReturnThis(),
	query: jest.fn().mockReturnThis(),
	then: jest.fn(),
} ) );

describe( 'GutenbergComponentExample', () => {
	test( 'should retrieve the code when mounted', () => {
		const wrapper = shallow( <GutenbergComponentExample /> );
		wrapper.instance().getCode = jest.fn();
		wrapper.instance().componentDidMount();
		expect( wrapper.instance().getCode ).toHaveBeenCalled();
	} );

	test( 'should retrieve the code from the README file', () => {
		const wrapper = shallow( <GutenbergComponentExample readmeFilePath="bar" /> );
		wrapper.instance().componentDidMount();
		expect( request.get ).toHaveBeenCalledWith( '/devdocs/service/content' );
		expect( request.query ).toHaveBeenCalledWith( {
			path: '/node_modules/@wordpress/components/src/bar/README.md',
			format: 'markdown',
		} );
	} );
} );
