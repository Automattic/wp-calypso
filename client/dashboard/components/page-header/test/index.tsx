/**
 * @jest-environment jsdom
 */
import { Breadcrumbs } from '@automattic/components/src/breadcrumbs';
import { render, screen } from '@testing-library/react';
import { PageHeader } from '..';

describe( 'PageHeader', () => {
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
