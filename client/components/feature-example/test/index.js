/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import FeatureExample from '../index';

describe( 'Feature Example', () => {
	test( 'should have Feature-example class', () => {
		const { container } = render( <FeatureExample /> );
		expect( container.firstChild ).toHaveClass( 'feature-example' );
	} );

	test( 'should contains the passed children wrapped by a feature-example__content div', () => {
		render(
			<FeatureExample>
				<div>Test feature</div>
			</FeatureExample>
		);
		const textWrapper = screen.getByText( 'Test feature' );
		expect( textWrapper ).toBeVisible();
		expect( textWrapper.parentNode ).toHaveClass( 'feature-example__content' );
	} );
} );
