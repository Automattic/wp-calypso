/**
 * External dependencies
 */
import { uniqueId } from 'lodash';

import { render, fireEvent } from '@testing-library/react';

import { templatesFixture, blocksByTemplatesFixture } from './helpers/templates-blocks-helpers';
import { TemplateSelectorControl } from '../template-selector-control';

// Mock out this component until @wordpress/block-editor
// `BlockPreview` component is available as default export.
// Once available, swap this mock to mocking out `BlockPreview`
// directly as it causes too many knock on effects when rendering
jest.mock( '../block-template-preview', () => () => {
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

describe( 'TemplateSelectorControl', () => {
	const siteInformation = {
		title: 'gutenberg-training',
		vertical: 'Business',
	};

	describe( 'Basic rendering', () => {
		it( 'renders with required props', () => {
			const { getByText, container } = render(
				<TemplateSelectorControl
					label="Select a Template..."
					instanceId={ uniqueId() }
					templates={ templatesFixture }
					blocksByTemplates={ blocksByTemplatesFixture }
					siteInformation={ siteInformation }
				/>
			);

			expect( getByText( 'Select a Template...' ) ).toBeInTheDocument();
			expect( document.querySelectorAll( 'button.template-selector-item__label' ) ).toHaveLength(
				3
			);
			expect( container ).toMatchSnapshot();
		} );

		it( 'does not render when missing templates prop', () => {
			const { queryByText, queryByTestId } = render(
				<TemplateSelectorControl
					label="Select a Template..."
					instanceId={ uniqueId() }
					blocksByTemplates={ blocksByTemplatesFixture }
				/>
			);

			// use `queryBy` to avoid throwing an error with `getBy`
			expect( queryByText( 'Select a Template...' ) ).not.toBeInTheDocument();
			expect( queryByTestId( 'template-selector-control-options' ) ).not.toBeInTheDocument();
		} );

		it( 'does not render when templates prop is not an Array', () => {
			const { queryByText, queryByTestId } = render(
				<TemplateSelectorControl
					label="Select a Template..."
					instanceId={ uniqueId() }
					templates={ 'evil stuff here' }
					blocksByTemplates={ blocksByTemplatesFixture }
				/>
			);

			expect( queryByText( 'Select a Template...' ) ).not.toBeInTheDocument();
			expect( queryByTestId( 'template-selector-control-options' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Event handlers', () => {
		it( 'calls onTemplateFocus prop on mouseEnter over template', () => {
			const onFocusSpy = jest.fn();

			const { getByText } = render(
				<TemplateSelectorControl
					label="Select a Template..."
					instanceId={ uniqueId() }
					templates={ templatesFixture }
					blocksByTemplates={ blocksByTemplatesFixture }
					siteInformation={ siteInformation }
					onTemplateFocus={ onFocusSpy }
				/>
			);

			fireEvent.mouseEnter( getByText( 'Template 2' ) );

			expect( onFocusSpy ).toHaveBeenCalled();
		} );

		it( 'calls onTemplateSelect prop when template is clicked', () => {
			const onSelectSpy = jest.fn();

			const { getByText } = render(
				<TemplateSelectorControl
					label="Select a Template..."
					instanceId={ uniqueId() }
					templates={ templatesFixture }
					blocksByTemplates={ blocksByTemplatesFixture }
					siteInformation={ siteInformation }
					onTemplateSelect={ onSelectSpy }
				/>
			);

			fireEvent.click( getByText( 'Template 3' ) );

			expect( onSelectSpy ).toHaveBeenCalled();
		} );
	} );

	describe( 'Static previews', () => {
		it( 'renders in static preview mode by default ', () => {
			const { getByAltText } = render(
				<TemplateSelectorControl
					label="Select a Template..."
					instanceId={ uniqueId() }
					templates={ templatesFixture }
					blocksByTemplates={ blocksByTemplatesFixture }
					siteInformation={ siteInformation }
				/>
			);

			expect( getByAltText( 'Testing alt 2' ) ).toBeInTheDocument();
			expect( document.querySelectorAll( 'img.template-selector-item__media' ) ).toHaveLength( 3 );
		} );
	} );

	describe( 'Dynamic previews', () => {
		it( 'renders in dynamic preview mode when useDynamicPreview is true', () => {
			const { queryByAltText, getAllByTestId } = render(
				<TemplateSelectorControl
					label="Select a Template..."
					instanceId={ uniqueId() }
					templates={ templatesFixture }
					blocksByTemplates={ blocksByTemplatesFixture }
					siteInformation={ siteInformation }
					useDynamicPreview={ true }
				/>
			);

			const mockedBlockTemplatePreviews = getAllByTestId( 'block-template-preview' );

			expect( mockedBlockTemplatePreviews ).toHaveLength( 3 );
			expect( queryByAltText( 'Testing alt 2' ) ).not.toBeInTheDocument();
			expect( document.querySelectorAll( 'img.template-selector-item__media' ) ).toHaveLength( 0 );
		} );

		it( 'does not render without blocksByTemplatesFixture prop when in dynamic mode', () => {
			const { queryByLabelText, queryByTestId } = render(
				<TemplateSelectorControl
					label="Select a Template..."
					instanceId={ uniqueId() }
					templates={ templatesFixture }
					siteInformation={ siteInformation }
					useDynamicPreview={ true }
				/>
			);

			expect( queryByLabelText( 'Select a Template...' ) ).not.toBeInTheDocument();
			expect( queryByTestId( 'template-selector-control-options' ) ).not.toBeInTheDocument();
		} );
	} );
} );
