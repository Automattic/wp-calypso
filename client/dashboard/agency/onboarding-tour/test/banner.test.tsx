/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import OnboardingTourBanner from '../banner';
import { getOnboardingTourSections } from '../sections';

describe( '<OnboardingTourBanner>', () => {
	test.each( getOnboardingTourSections().map( ( { id } ) => id ) )(
		'draws the %s section on its field',
		( sectionId ) => {
			const { container } = render( <OnboardingTourBanner sectionId={ sectionId } isVisible /> );
			const field = container.firstElementChild as HTMLElement;

			expect( field ).toHaveClass( 'is-visible' );
			expect( field.style.backgroundImage ).not.toBe( '' );
			expect( container.querySelector( 'img' ) ).toHaveAttribute( 'alt', '' );
			expect( container.querySelector( 'img' )?.getAttribute( 'src' ) ).toBeTruthy();
		}
	);
} );
