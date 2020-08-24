/**
 * External dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { uniqueId, omit } from 'lodash';
import { render, fireEvent } from '@testing-library/react';
/* eslint-enable import/no-extraneous-dependencies */

import { templatesFixture, blocksByTemplatesFixture } from './helpers/templates-blocks-helpers';
import { TemplateSelectorControl } from '../template-selector-control';

// Mock out this component until @wordpress/block-editor
// `BlockPreview` component is available as default export.
// Once available, swap this mock to mocking out `BlockPreview`
// directly as it causes too many knock on effects when rendering
jest.mock( '../block-iframe-preview', () => () => {
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

const testUniqueId = uniqueId();

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
					instanceId={ testUniqueId }
					templates={ templatesFixture }
					blocksByTemplates={ blocksByTemplatesFixture }
					siteInformation={ siteInformation }
				/>
			);

			expect( getByText( 'Select a Template...' ) ).toBeInTheDocument();
			expect( getByText( ( content, element ) => element.value === 'blank' ) ).toBeInTheDocument();
			expect( document.querySelectorAll( 'button.template-selector-item__label' ) ).toHaveLength(
				4
			);
			expect( document.querySelectorAll( 'button.is-selected' ) ).toHaveLength( 0 );
			expect( container ).toMatchSnapshot();
		} );

		it( 'highlights the selected template', () => {
			render(
				<TemplateSelectorControl
					label="Select a Template..."
					instanceId={ testUniqueId }
					templates={ templatesFixture }
					blocksByTemplates={ blocksByTemplatesFixture }
					siteInformation={ siteInformation }
					selectedTemplate={ templatesFixture[ 0 ].slug }
				/>
			);

			expect( document.querySelectorAll( 'button.is-selected' ) ).toHaveLength( 1 );
		} );

		it( 'does not render when missing templates prop', () => {
			const { queryByText, queryByTestId } = render(
				<TemplateSelectorControl
					label="Select a Template..."
					instanceId={ testUniqueId }
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
					instanceId={ testUniqueId }
					templates={ 'evil stuff here' }
					blocksByTemplates={ blocksByTemplatesFixture }
				/>
			);

			expect( queryByText( 'Select a Template...' ) ).not.toBeInTheDocument();
			expect( queryByTestId( 'template-selector-control-options' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Event handlers', () => {
		it( 'calls onTemplateSelect prop when template is clicked', () => {
			const onSelectSpy = jest.fn();

			const { getByText } = render(
				<TemplateSelectorControl
					label="Select a Template..."
					instanceId={ testUniqueId }
					templates={ templatesFixture }
					blocksByTemplates={ blocksByTemplatesFixture }
					siteInformation={ siteInformation }
					onTemplateSelect={ onSelectSpy }
				/>
			);

			fireEvent.click( getByText( ( content, element ) => element.value === 'template-3' ) );

			expect( onSelectSpy ).toHaveBeenCalled();
		} );
	} );

	describe( 'Static previews', () => {
		it( 'renders in static preview mode by default ', () => {
			const { getByAltText } = render(
				<TemplateSelectorControl
					label="Select a Template..."
					instanceId={ testUniqueId }
					templates={ templatesFixture }
					blocksByTemplates={ blocksByTemplatesFixture }
					siteInformation={ siteInformation }
				/>
			);

			expect( getByAltText( 'Testing alt 2' ) ).toBeInTheDocument();
			expect( document.querySelectorAll( 'img.template-selector-item__media' ) ).toHaveLength( 4 );
		} );

		it( 'renders in "blank" mode when static preview is not provided ', () => {
			const templatesFixtureWithoutPreviews = templatesFixture.map( ( template ) =>
				omit( template, 'preview' )
			);

			const { getByText } = render(
				<TemplateSelectorControl
					label="Select a Template..."
					instanceId={ testUniqueId }
					templates={ templatesFixtureWithoutPreviews }
					blocksByTemplates={ blocksByTemplatesFixture }
					siteInformation={ siteInformation }
				/>
			);

			expect( getByText( 'Select a Template...' ) ).toBeInTheDocument();
			expect( getByText( ( content, element ) => element.value === 'blank' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Dynamic previews', () => {
		it( 'renders in dynamic preview mode when useDynamicPreview is true', () => {
			const { queryByAltText, getAllByTestId } = render(
				<TemplateSelectorControl
					label="Select a Template..."
					instanceId={ testUniqueId }
					templates={ templatesFixture }
					blocksByTemplates={ blocksByTemplatesFixture }
					siteInformation={ siteInformation }
					useDynamicPreview={ true }
				/>
			);

			const mockedBlockTemplatePreviews = getAllByTestId( 'block-template-preview' );

			expect( mockedBlockTemplatePreviews ).toHaveLength( 4 );
			expect( queryByAltText( 'Testing alt 2' ) ).not.toBeInTheDocument();
			expect( document.querySelectorAll( 'img.template-selector-item__media' ) ).toHaveLength( 0 );
		} );

		it( 'does not render without blocksByTemplatesFixture prop when in dynamic mode', () => {
			const { queryByLabelText, queryByTestId } = render(
				<TemplateSelectorControl
					label="Select a Template..."
					instanceId={ testUniqueId }
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
