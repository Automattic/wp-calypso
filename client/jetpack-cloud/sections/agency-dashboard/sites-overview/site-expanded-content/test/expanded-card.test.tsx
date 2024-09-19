/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ExpandedCard from '../expanded-card';

describe( 'ExpandedCard', () => {
	const header = 'Test Header';
	const children = <div>Test Children</div>;
	const emptyContent = 'Test Empty Content';
	const onClick = jest.fn();
	const href = 'https://example.com';

	test( 'should render header and children when enabled', () => {
		render(
			<ExpandedCard header={ header } isEnabled>
				{ children }
			</ExpandedCard>
		);
		expect( screen.getByText( header ) ).toBeInTheDocument();
		expect( screen.getByText( 'Test Children' ) ).toBeInTheDocument();
	} );

	test( 'should render empty content when not enabled', () => {
		render( <ExpandedCard emptyContent={ emptyContent } isEnabled={ false } /> );
		expect( screen.getByText( 'Test Empty Content' ) ).toBeInTheDocument();
	} );

	test( 'should not be clickable when onClick is not provided', () => {
		render( <ExpandedCard /> );
		expect( screen.getByTestId( 'expanded-card' ) ).not.toHaveAttribute( 'tabIndex' );
		expect( screen.getByTestId( 'expanded-card' ) ).not.toHaveAttribute( 'onClick' );
	} );

	test( 'should be clickable when onClick is provided and not loading', () => {
		render( <ExpandedCard onClick={ onClick } /> );
		expect( screen.getByRole( 'button' ) ).toHaveAttribute( 'tabIndex', '0' );
		fireEvent.click( screen.getByRole( 'button' ) );
		expect( onClick ).toHaveBeenCalled();
	} );

	test( 'should not be clickable when isLoading is true', () => {
		render( <ExpandedCard onClick={ onClick } isLoading /> );
		expect( screen.getByTestId( 'expanded-card' ) ).not.toHaveAttribute( 'tabIndex' );
		expect( screen.getByTestId( 'expanded-card' ) ).not.toHaveAttribute( 'onClick' );
	} );

	test( 'should have href when provided', () => {
		render( <ExpandedCard href={ href } /> );
		expect( screen.getByRole( 'link' ) ).toHaveAttribute( 'href', 'https://example.com' );
	} );
} );
