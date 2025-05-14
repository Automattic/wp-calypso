/**
 * @jest-environment jsdom
 */
import { Breadcrumbs } from '@automattic/components/src/breadcrumbs';
import { render, screen } from '@testing-library/react';
import { Button, Icon } from '@wordpress/components';
import { cog } from '@wordpress/icons';
import { PageHeader } from '..';

describe( 'PageHeader', () => {
	test( 'should render with title', () => {
		render( <PageHeader title="Test Title" /> );
		expect( screen.getByRole( 'heading', { name: 'Test Title' } ) ).toBeVisible();
	} );
	test( 'should render with description', () => {
		render( <PageHeader title="Test Title" description="Test Description" /> );
		expect( screen.getByText( 'Test Description' ) ).toBeVisible();
	} );
	test( 'should render with action buttons', () => {
		render(
			<PageHeader
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
			<PageHeader
				title="Test Title"
				decoration={ <Icon data-testid="decoration" icon={ cog } /> }
			/>
		);
		expect( screen.getByTestId( 'decoration' ) ).toBeVisible();
	} );
	test( 'should render with breadcrumbs', () => {
		render(
			<PageHeader
				title="Test Title"
				breadcrumbs={
					<Breadcrumbs
						items={ [
							{ label: 'Home', href: '/' },
							{ label: 'Products', href: '/products' },
							{ label: 'Categories', href: '/products/categories' },
						] }
					/>
				}
			/>
		);
		expect( screen.getByRole( 'heading', { name: 'Test Title' } ).tagName ).toBe( 'H1' );
		expect( screen.getByRole( 'navigation' ) ).toHaveAccessibleName( 'Breadcrumbs' );
		expect( screen.getAllByRole( 'listitem' ) ).toHaveLength( 3 );
	} );
} );
