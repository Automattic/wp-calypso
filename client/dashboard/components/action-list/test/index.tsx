/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Button } from '@wordpress/components';
import ActionList from '../index';

describe( 'ActionList', () => {
	test( 'should render the title and action item by default', () => {
		render(
			<ActionList>
				<ActionList.ActionItem title="Action item title" actions={ <Button>Action</Button> } />
			</ActionList>
		);

		expect( screen.getByText( 'Action List' ) ).toBeVisible();
		expect( screen.getByText( 'Action item title' ) ).toBeVisible();
	} );

	test( 'should render the title and description', () => {
		render(
			<ActionList title="Action List" description="description">
				<ActionList.ActionItem title="Action item title" actions={ <Button>Action</Button> } />
			</ActionList>
		);

		expect( screen.getByText( 'Action List' ) ).toBeVisible();
		expect( screen.getByText( 'description' ) ).toBeVisible();
	} );

	test( 'should render multiple action items', () => {
		render(
			<ActionList title="Action List">
				<ActionList.ActionItem title="Action item title 1" actions={ <Button>Action</Button> } />
				<ActionList.ActionItem title="Action item title 2" actions={ <Button>Action</Button> } />
			</ActionList>
		);

		expect( screen.getByText( 'Action item title 1' ) ).toBeVisible();
		expect( screen.getByText( 'Action item title 2' ) ).toBeVisible();
	} );
} );
