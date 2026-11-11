/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { useExperiment } from 'calypso/lib/explat';
import NewBlogsExperimentSlot, { NEW_BLOGS_EXPERIMENT } from '../experiment-slot';

jest.mock( 'calypso/lib/explat', () => ( {
	useExperiment: jest.fn(),
} ) );
// The module itself is covered by index.test.tsx.
jest.mock( '../index', () => () => <section data-testid="discover-new-blogs" /> );

const mockUseExperiment = useExperiment as jest.Mock;

const renderSlot = () =>
	render( <NewBlogsExperimentSlot recs={ [] } dismissBlog={ jest.fn() } hide={ jest.fn() } /> );

describe( 'NewBlogsExperimentSlot', () => {
	afterEach( () => jest.resetAllMocks() );

	it( 'assigns the user to the READ-543 experiment on mount', () => {
		mockUseExperiment.mockReturnValue( [ true, null ] );
		renderSlot();
		expect( mockUseExperiment ).toHaveBeenCalledWith( NEW_BLOGS_EXPERIMENT );
	} );

	it( 'renders nothing while the assignment loads', () => {
		mockUseExperiment.mockReturnValue( [ true, null ] );
		const { container } = renderSlot();
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders nothing for control', () => {
		mockUseExperiment.mockReturnValue( [ false, { variationName: 'control' } ] );
		const { container } = renderSlot();
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders nothing without an assignment', () => {
		mockUseExperiment.mockReturnValue( [ false, { variationName: null } ] );
		const { container } = renderSlot();
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders the module for treatment', () => {
		mockUseExperiment.mockReturnValue( [ false, { variationName: 'treatment' } ] );
		renderSlot();
		expect( screen.getByTestId( 'discover-new-blogs' ) ).toBeInTheDocument();
	} );
} );
