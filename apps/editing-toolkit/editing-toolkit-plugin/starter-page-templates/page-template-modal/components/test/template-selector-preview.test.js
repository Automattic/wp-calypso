/**
 * External dependencies
 */

import { render } from '@testing-library/react';
import { blocksFixture } from './helpers/templates-blocks-helpers';
import TemplateSelectorPreview from '../template-selector-preview';

// Mock the "pass through" version of the `BlockPreview` component
// See `components/block-preview.js`
jest.mock( '../block-preview', () => () => {
	return <div data-testid="block-preview">MockedBlockPreview</div>;
} );

// Required to handle `BlockPreview` usage of Mutation Observer
beforeAll(
	( global.MutationObserver = jest.fn( () => {
		return {
			observe: jest.fn(),
			disconnect: jest.fn(),
		};
	} ) )
);

afterAll( () => {
	global.MutationObserver.mockRestore();
} );

describe( 'TemplateSelectorPreview', () => {
	describe( 'Basic rendering', () => {
		it( 'renders the preview and no placeholder when blocks are provided', () => {
			const { queryByText, getByTitle, container } = render(
				<TemplateSelectorPreview blocks={ blocksFixture } viewportWidth={ 960 } />
			);

			expect( getByTitle( 'Preview' ) ).toBeInTheDocument();
			expect( queryByText( 'Select a layout to preview.' ) ).not.toBeInTheDocument();
			expect( container ).toMatchSnapshot();
		} );

		it( 'renders placeholder when no blocks are provided', () => {
			const { getByText } = render( <TemplateSelectorPreview viewportWidth={ 960 } /> );

			expect( getByText( 'Select a layout to preview.' ) ).toBeInTheDocument();
		} );

		it( 'renders placeholder when blocks is not an array', () => {
			const invalidBlocksProp = {
				'some-block-1': {
					block: 'foo',
				},
				'some-block-2': {
					block: 'bar',
				},
			};
			const { getByText } = render(
				<TemplateSelectorPreview blocks={ invalidBlocksProp } viewportWidth={ 960 } />
			);

			expect( getByText( 'Select a layout to preview.' ) ).toBeInTheDocument();
		} );

		it( 'renders "pending" preview container even when no blocks are provided', () => {
			const { getByTitle } = render( <TemplateSelectorPreview viewportWidth={ 960 } /> );

			// We're testing that the iframe is rendered even if there are no
			// blocks. This is because unless we pre-render the iframe, when we
			// click on template to preview there is a noticeable delay in some
			// browsers (eg: Firefox) before the blocks get rendered. By
			// pre-rendering the iframe we avoid this. Therefore this test is
			// designed to assert that the iframe is always present even though
			// this seems counter intuative.
			expect( getByTitle( 'Preview' ) ).toBeInTheDocument();
		} );
	} );
} );
