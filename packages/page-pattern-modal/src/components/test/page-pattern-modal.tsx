/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { render, fireEvent, screen } from '@testing-library/react';
import { registerBlockType, unregisterBlockType } from '@wordpress/blocks';
import React from 'react';

/**
 * Internal dependencies
 */
import PagePatternModal from '../page-pattern-modal';

const noop = () => undefined;

const patterns = [
	{ ID: null, title: 'Blank', name: 'blank' },
	{
		ID: 1,
		title: 'Layout One',
		name: 'layout-one',
		description: 'Descriptive Name One',
		categories: { blog: { slug: 'blog', title: 'Blog' } },
		html: `<!-- wp:test/test-block -->layout content ...<!-- /wp:test/test-block -->`,
	},
	{
		ID: 2,
		title: 'Layout Two',
		name: 'layout-two',
		description: 'Descriptive Name Two',
		categories: { blog: { slug: 'blog', title: 'Blog' }, home: { slug: 'home', title: 'Home' } },
		html: `<!-- wp:test/test-block -->layout content ...<!-- /wp:test/test-block -->`,
	},
];

let originalReact;
beforeEach( () => {
	// The component uses `@wordpress/element` but the test assumes the React
	// global will be available. Mock it so it's available.
	originalReact = window.React;
	window.React = React;

	// Block parser requires blocks to be registered first
	registerBlockType( 'test/test-block', {
		attributes: {
			content: { type: 'string', source: 'text' },
		},
		save: ( { attributes } ) => <>{ attributes.content }</>,
		category: 'text',
		title: 'test block',
	} );
} );

afterEach( () => {
	window.React = originalReact;
	unregisterBlockType( 'test/test-block' );
} );

describe( '<PagePatternModal>', () => {
	it( 'sets the page title after selecting a layout', () => {
		const insertPattern = jest.fn();
		render(
			<PagePatternModal
				isOpen={ true }
				patterns={ patterns }
				insertPattern={ insertPattern }
				savePatternChoice={ noop }
				setOpenState={ noop }
				hideWelcomeGuide={ noop }
			/>
		);
		// 1th button because the 0th is the mobile drop down menu
		fireEvent.click( screen.getAllByText( 'Blog' )[ 1 ] );
		fireEvent.click( screen.getByText( 'Descriptive Name One' ) );
		expect( insertPattern ).toHaveBeenCalledWith( 'Layout One', expect.anything() );
	} );

	it( "doesn't set the page title after selecting a home page layout", () => {
		const insertPattern = jest.fn();
		render(
			<PagePatternModal
				isOpen={ true }
				patterns={ patterns }
				insertPattern={ insertPattern }
				savePatternChoice={ noop }
				setOpenState={ noop }
				hideWelcomeGuide={ noop }
			/>
		);
		// 1th button because the 0th is the mobile drop down menu
		fireEvent.click( screen.getAllByText( 'Home' )[ 1 ] );
		fireEvent.click( screen.getByText( 'Descriptive Name Two' ) );
		expect( insertPattern ).toHaveBeenCalledWith( null, expect.anything() );
	} );

	it( 'clears the page title after selecting blank layout', () => {
		const insertPattern = jest.fn();
		render(
			<PagePatternModal
				isOpen={ true }
				patterns={ patterns }
				insertPattern={ insertPattern }
				savePatternChoice={ noop }
				setOpenState={ noop }
				hideWelcomeGuide={ noop }
			/>
		);
		fireEvent.click( screen.getByText( 'Blank page' ) );
		expect( insertPattern ).toHaveBeenCalledWith( '', expect.anything() );
	} );
} );
