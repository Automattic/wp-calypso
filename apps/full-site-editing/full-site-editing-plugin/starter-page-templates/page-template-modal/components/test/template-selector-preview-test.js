/**
 * External dependencies
 */
import { render } from '@testing-library/react';
import { blocksFixture } from './helpers/templates-blocks-helpers';
import TemplateSelectorPreview from '../template-selector-preview';

// Mock the "pass through" version of the `BlockPreview` component
// See `components/block-preview.js`
jest.mock( '../block-preview', () => () => {
	return <div data-testid="block-template-preview">MockedBlockPreview</div>;
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
		it( 'renders the preview when blocks are provided', () => {
			const { queryByTestId, container } = render(
				<TemplateSelectorPreview blocks={ blocksFixture } viewportWidth={ 960 } />
			);

			expect( queryByTestId( 'block-template-preview' ) ).toBeInTheDocument();
			expect( container ).toMatchSnapshot();
		} );

		it( 'renders placeholder when no blocks are provided', () => {
			const { getByText, queryByTestId } = render(
				<TemplateSelectorPreview viewportWidth={ 960 } />
			);

			expect( getByText( 'Select a layout to preview.' ) ).toBeInTheDocument();
			expect( queryByTestId( 'block-template-preview' ) ).not.toBeInTheDocument();
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
			const { getByText, queryByTestId } = render(
				<TemplateSelectorPreview blocks={ invalidBlocksProp } viewportWidth={ 960 } />
			);

			expect( getByText( 'Select a layout to preview.' ) ).toBeInTheDocument();
			expect( queryByTestId( 'block-template-preview' ) ).not.toBeInTheDocument();
		} );
	} );
} );
