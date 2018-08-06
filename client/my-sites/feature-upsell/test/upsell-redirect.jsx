/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { UpsellRedirectWrapper } from '../redirect-if';

/**
 * Module variables
 */

describe( 'redirectIf', () => {
	const defaultProps = {
		siteId: 1,
		upsellPageURL: '/',
		shouldRedirectToUpsellPage: false,
	};
	describe( 'Wrapper - unit tests', () => {
		test( 'shouldRedirectToUpsellPage() should return true if and only if plan is already available', () => {
			const test = props => new UpsellRedirectWrapper( props ).shouldRedirectToUpsellPage();
			expect( test( { shouldRedirectToUpsellPage: true, loadingPlan: true } ) ).toBe( false );
			expect( test( { shouldRedirectToUpsellPage: false, loadingPlan: true } ) ).toBe( false );
			expect( test( { shouldRedirectToUpsellPage: false, loadingPlan: false } ) ).toBe( false );
			expect( test( { shouldRedirectToUpsellPage: true, loadingPlan: false } ) ).toBe( true );
		} );
	} );

	describe( 'Wrapper - enzyme tests', () => {
		test( 'Renders nothing when current plan is still being loaded', () => {
			const rendered = shallow(
				<UpsellRedirectWrapper
					{ ...defaultProps }
					ComponentClass={ 'div' }
					loadingPlan={ true }
					shouldRedirectToUpsellPage={ true }
				/>
			);
			expect( rendered.find( 'div' ).length ).toBe( 0 );
		} );

		test( 'Renders nothing when current plan is already loaded and redirect is required', () => {
			const rendered = shallow(
				<UpsellRedirectWrapper
					{ ...defaultProps }
					ComponentClass={ 'div' }
					loadingPlan={ false }
					shouldRedirectToUpsellPage={ true }
				/>
			);
			expect( rendered.find( 'div' ).length ).toBe( 0 );
		} );

		test( 'Renders ComponentClass when current plan is already loaded and redirect is not required', () => {
			const rendered = shallow(
				<UpsellRedirectWrapper
					{ ...defaultProps }
					ComponentClass={ 'div' }
					loadingPlan={ false }
					shouldRedirectToUpsellPage={ false }
				/>
			);
			expect( rendered.find( 'div' ).length ).toBe( 1 );
		} );
	} );
} );
