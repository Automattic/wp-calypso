/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Button, Icon } from '@wordpress/components';
import { cog } from '@wordpress/icons';
import ActionItem from '../index';

describe( 'ActionItem', () => {
	test( 'should render the title and actions by default', () => {
		render( <ActionItem title="Action title" actions={ <Button>Action</Button> } /> );

		expect( screen.getByText( 'Action title' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Action' } ) ).toBeVisible();
	} );

	test( 'should render multiple actions', () => {
		render(
			<ActionItem
				title="Action title"
				actions={
					<>
						<Button>Action 1</Button>
						<Button>Action 2</Button>
					</>
				}
			/>
		);

		expect( screen.getByText( 'Action title' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Action 1' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Action 2' } ) ).toBeVisible();
	} );

	test( 'should render the description if given', () => {
		render(
			<ActionItem
				title="Action title"
				description="Action description"
				actions={ <Button>Action</Button> }
			/>
		);

		expect( screen.getByText( 'Action description' ) ).toBeVisible();
	} );

	test( 'should render the decoration if given', () => {
		render(
			<ActionItem
				title="Action title"
				decoration={ <Icon data-testid="decoration" icon={ cog } /> }
				actions={ <Button>Action</Button> }
			/>
		);

		expect( screen.getByTestId( 'decoration' ) ).toBeVisible();
	} );
} );
