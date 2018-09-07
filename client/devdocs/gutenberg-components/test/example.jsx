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
	query: jest.fn().mockResolvedValue( { text: 'foo' } ),
} ) );

describe( 'GutenbergComponentExample', () => {
	test( 'should retrieve the code when mounted', () => {
		const wrapper = shallow( <GutenbergComponentExample />, {
			disableLifecycleMethods: true,
		} );
		wrapper.instance().getCode = jest.fn();
		wrapper.instance().componentDidMount();
		expect( wrapper.instance().getCode ).toHaveBeenCalled();
	} );

	test( 'should retrieve the README file from node_modules', async () => {
		const wrapper = shallow( <GutenbergComponentExample readmeFilePath="bar" />, {
			disableLifecycleMethods: true,
		} );
		await wrapper.instance().getReadme();
		expect( request.get ).toHaveBeenCalledWith( '/devdocs/service/content' );
		expect( request.query ).toHaveBeenCalledWith( {
			path: '/node_modules/@wordpress/components/src/bar/README.md',
			format: 'markdown',
		} );
	} );

	test( 'should get the code from the first jsx block', async () => {
		const wrapper = shallow( <GutenbergComponentExample />, {
			disableLifecycleMethods: true,
		} );
		const mockedReadme = '# test\n```jsx\nmy code\n```\n```jsx\ntest\n```';
		wrapper.instance().getReadme = jest.fn().mockResolvedValue( mockedReadme );
		await wrapper.instance().getCode();
		expect( wrapper.state().code ).toContain( 'my code' );
		expect( wrapper.state().code ).not.toContain( 'test' );
	} );

	test( 'should remove the imports from the example', async () => {
		const wrapper = shallow( <GutenbergComponentExample />, {
			disableLifecycleMethods: true,
		} );
		const mockedReadme = '```jsx\nimport test\nmy code\n```';
		wrapper.instance().getReadme = jest.fn().mockResolvedValue( mockedReadme );
		await wrapper.instance().getCode();
		expect( wrapper.state().code ).not.toContain( 'import test' );
	} );

	test( 'should render the given component', async () => {
		const wrapper = shallow( <GutenbergComponentExample render="MyTestComponent" />, {
			disableLifecycleMethods: true,
		} );
		const mockedReadme = '```jsx\nmy code\n```';
		wrapper.instance().getReadme = jest.fn().mockResolvedValue( mockedReadme );
		await wrapper.instance().getCode();
		expect( wrapper.state().code ).toContain( 'render( <MyTestComponent /> )' );
	} );
} );
