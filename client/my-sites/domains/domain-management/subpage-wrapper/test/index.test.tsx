/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import SubPageWrapper from '../index';
import { ADD_FOWARDING_EMAIL } from '../subpages';

describe( 'SubPageWrapper', () => {
	it( 'should render the children', () => {
		render(
			<SubPageWrapper subPageKey={ ADD_FOWARDING_EMAIL }>
				<span>Hello</span>
			</SubPageWrapper>
		);

		expect( screen.getByText( 'Hello' ) ).toBeInTheDocument();
	} );

	it( 'should render the children with the subpage header', () => {
		render(
			<SubPageWrapper subPageKey={ ADD_FOWARDING_EMAIL }>
				<span>Hello</span>
			</SubPageWrapper>
		);

		expect( screen.getByText( 'Add new email forwarding' ) ).toBeInTheDocument();
		expect(
			screen.getByText( 'Seamlessly redirect your messages to where you need them.' )
		).toBeInTheDocument();
	} );

	it( 'should render the children without the subpage header', () => {
		render(
			<SubPageWrapper subPageKey="non-existent">
				<span>Hello</span>
			</SubPageWrapper>
		);

		expect( screen.getByText( 'Hello' ) ).toBeInTheDocument();
	} );
} );
