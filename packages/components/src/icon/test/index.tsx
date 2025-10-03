/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Path, SVG } from '@wordpress/primitives';
import { Icon } from '..';

describe( 'Icon', () => {
	const testId = 'icon';
	const className = 'example-class';
	const svg = (
		<SVG>
			<Path d="M5 4v3h5.5v12h3V7H19V4z" />
		</SVG>
	);

	it( 'renders nothing when icon omitted', () => {
		render( <Icon data-testid={ testId } /> );

		expect( screen.queryByTestId( testId ) ).not.toBeInTheDocument();
	} );

	it( 'renders a function', () => {
		render( <Icon icon={ () => <span data-testid={ testId } /> } /> );

		expect( screen.getByTestId( testId ) ).toBeVisible();
	} );

	it( 'renders an element', () => {
		render( <Icon icon={ <span data-testid={ testId } /> } /> );

		expect( screen.getByTestId( testId ) ).toBeVisible();
	} );

	it( 'renders an svg element', () => {
		render( <Icon data-testid={ testId } icon={ svg } /> );

		expect( screen.getByTestId( testId ) ).toBeVisible();
	} );

	it( 'renders an svg element with a default width and height of 24', () => {
		render( <Icon data-testid={ testId } icon={ svg } /> );
		const icon = screen.getByTestId( testId );

		expect( icon ).toHaveAttribute( 'width', '24' );
		expect( icon ).toHaveAttribute( 'height', '24' );
	} );

	it( 'renders an svg element and override its width and height', () => {
		render(
			<Icon
				data-testid={ testId }
				icon={
					<SVG width={ 64 } height={ 64 }>
						<Path d="M5 4v3h5.5v12h3V7H19V4z" />
					</SVG>
				}
				size={ 32 }
			/>
		);
		const icon = screen.getByTestId( testId );

		expect( icon ).toHaveAttribute( 'width', '32' );
		expect( icon ).toHaveAttribute( 'height', '32' );
	} );

	it( 'renders an svg element and does not override width and height if already specified', () => {
		render( <Icon data-testid={ testId } icon={ svg } size={ 32 } /> );
		const icon = screen.getByTestId( testId );

		expect( icon ).toHaveAttribute( 'width', '32' );
		expect( icon ).toHaveAttribute( 'height', '32' );
	} );

	it( 'renders a component', () => {
		const MyComponent = () => <span data-testid={ testId } className={ className } />;
		render( <Icon icon={ MyComponent } /> );

		expect( screen.getByTestId( testId ) ).toHaveClass( className );
	} );
} );
