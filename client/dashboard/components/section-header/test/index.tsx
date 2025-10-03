/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Button, Icon } from '@wordpress/components';
import { cog } from '@wordpress/icons';
import { SectionHeader } from '..';

describe( 'SectionHeader', () => {
	test( 'should render with title', () => {
		render( <SectionHeader title="Test Title" /> );
		expect( screen.getByRole( 'heading', { name: 'Test Title' } ) ).toBeVisible();
	} );
	test( 'should render with description', () => {
		render( <SectionHeader title="Test Title" description="Test Description" /> );
		expect( screen.getByText( 'Test Description' ) ).toBeVisible();
	} );
	test( 'should render with action buttons', () => {
		render(
			<SectionHeader
				title="Test Title"
				actions={
					<>
						<Button>Cancel</Button>
						<Button>Save</Button>
					</>
				}
			/>
		);
		expect( screen.getByRole( 'button', { name: 'Cancel' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Save' } ) ).toBeVisible();
	} );
	test( 'should render with decoration', () => {
		render(
			<SectionHeader
				title="Test Title"
				decoration={ <Icon data-testid="decoration" icon={ cog } /> }
			/>
		);
		expect( screen.getByTestId( 'decoration' ) ).toBeVisible();
	} );
	test( 'should render with default level 2 heading', () => {
		render( <SectionHeader title="Test Title" /> );
		expect( screen.getByRole( 'heading', { name: 'Test Title' } ).tagName ).toBe( 'H2' );
	} );
	test( 'should render with different heading level when explicitly set', () => {
		render( <SectionHeader title="Test Title" level={ 3 } /> );
		expect( screen.getByRole( 'heading', { name: 'Test Title' } ).tagName ).toBe( 'H3' );
	} );
	test( 'should render with prefix content', () => {
		render(
			<SectionHeader
				title="Test Title"
				prefix={ <span data-testid="prefix">Prefix Content</span> }
			/>
		);
		expect( screen.getByTestId( 'prefix' ) ).toBeVisible();
		expect( screen.getByText( 'Prefix Content' ) ).toBeVisible();
	} );
} );
