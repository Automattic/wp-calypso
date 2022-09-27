/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import PluginAction from '../plugin-action';

jest.mock( 'calypso/components/info-popover', () =>
	require( 'calypso/components/empty-component' )
);

jest.mock( '@wordpress/components', () => ( {
	ToggleControl: () => <input type="checkbox" data-testid="toggle-control" />,
} ) );

describe( 'PluginAction', () => {
	describe( 'rendering with form toggle', () => {
		test( 'should have plugin-action class', () => {
			const { container } = render( <PluginAction /> );
			expect( container.firstChild ).toHaveClass( 'plugin-action' );
		} );

		test( 'should render compact form toggle when no children passed', () => {
			render( <PluginAction /> );
			const toggle = screen.queryByRole( 'checkbox' );
			expect( toggle ).toBeInTheDocument();
		} );

		test( 'should render a plugin action label alongside children', () => {
			render(
				<PluginAction label="plugin-action-label">
					<span data-testid="plugin-action-children" />
				</PluginAction>
			);

			const label = screen.queryByText( 'plugin-action-label' );
			const children = screen.queryByTestId( 'plugin-action-children' );

			expect( label ).toBeInTheDocument();
			expect( label ).toHaveClass( 'plugin-action__label-text' );

			expect( children ).toBeInTheDocument();
			expect( children.parentNode ).toHaveClass( 'plugin-action__children' );
		} );
	} );

	describe( 'rendering children', () => {
		test( 'should not render a form toggle when children exist', () => {
			render(
				<PluginAction>
					<span />
				</PluginAction>
			);

			const toggle = screen.queryByTestId( 'toggle-control' );
			expect( toggle ).not.toBeInTheDocument();
		} );

		test( 'should render child within plugin-action__children container', () => {
			render(
				<PluginAction>
					<span data-testid="plugin-action-children" />
				</PluginAction>
			);

			const children = screen.getByTestId( 'plugin-action-children' );

			expect( children ).toBeInTheDocument();
			expect( children.parentNode ).toHaveClass( 'plugin-action__children' );
		} );
	} );
} );
