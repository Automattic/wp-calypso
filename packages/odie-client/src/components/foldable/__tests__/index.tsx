/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import FoldableCard from '../index';

describe( 'FoldableCard', () => {
	const defaultProps = {
		header: 'Test Header',
		summary: 'Test Summary',
		expandedSummary: 'Test Expanded Summary',
		cardKey: 'testKey',
		onClick: jest.fn(),
		onOpen: jest.fn(),
		onClose: jest.fn(),
	};

	it( 'renders without crashing', () => {
		const { container } = render( <FoldableCard { ...defaultProps } /> );
		expect( container ).toBeInTheDocument();
	} );

	it( 'renders the header', () => {
		const { getByText } = render( <FoldableCard { ...defaultProps } /> );
		expect( getByText( defaultProps.header ) ).toBeInTheDocument();
	} );

	it( 'calls onClick when clicked', () => {
		const { getByText } = render( <FoldableCard { ...defaultProps } /> );
		fireEvent.click( getByText( defaultProps.header ) );
		expect( defaultProps.onClick ).toHaveBeenCalled();
	} );

	it( 'calls onOpen when expanded', () => {
		const { rerender } = render( <FoldableCard { ...defaultProps } /> );
		rerender( <FoldableCard { ...defaultProps } expanded /> );
		expect( defaultProps.onOpen ).toHaveBeenCalledWith( defaultProps.cardKey );
	} );
} );
