/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { identity, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { LoggedInForm } from '../auth-logged-in-form';

describe( 'LoggedInForm', () => {
	describe( 'isSso', () => {
		const isSso = new LoggedInForm().isSso;
		const queryDataSiteId = 12349876;

		test( 'returns true for valid SSO', () => {
			document.cookie = `jetpack_sso_approved=${ queryDataSiteId };`;
			const props = {
				authQuery: {
					from: 'sso',
					clientId: queryDataSiteId,
				},
			};
			expect( isSso( props ) ).toBe( true );
		} );

		test( 'returns false with non-sso from', () => {
			document.cookie = `jetpack_sso_approved=${ queryDataSiteId };`;
			const props = {
				authQuery: {
					from: 'elsewhere',
					clientId: queryDataSiteId,
				},
			};
			expect( isSso( props ) ).toBe( false );
		} );

		test( 'returns false without approved cookie', () => {
			document.cookie = 'jetpack_sso_approved=;';
			const props = {
				authQuery: {
					from: 'sso',
					clientId: queryDataSiteId,
				},
			};
			expect( isSso( props ) ).toBe( false );
		} );

		test( 'returns false with no cookie or queryDataSiteId', () => {
			document.cookie = 'jetpack_sso_approved=;';
			const props = {
				authQuery: {
					from: 'sso',
					clientId: null,
				},
			};
			expect( isSso( props ) ).toBe( false );
		} );
	} );

	describe( 'isWoo', () => {
		const isWoo = new LoggedInForm().isWoo;

		test( 'should return true for woo wizard', () => {
			const props = { authQuery: { from: 'woocommerce-services-auto-authorize' } };
			expect( isWoo( props ) ).toBe( true );
		} );

		test( 'should return true for woo services', () => {
			const props = { authQuery: { from: 'woocommerce-setup-wizard' } };
			expect( isWoo( props ) ).toBe( true );
		} );

		test( 'returns false with non-woo from', () => {
			const props = { authQuery: { from: 'elsewhere' } };
			expect( isWoo( props ) ).toBe( false );
		} );
	} );

	describe( 'shouldAutoAuthorize', () => {
		const renderableComponent = (
			<LoggedInForm
				authQuery={ {} }
				authAttempts={ 0 }
				authorizationData={ {} }
				authorize={ noop }
				goBackToWpAdmin={ noop }
				goToXmlrpcErrorFallbackUrl={ noop }
				recordTracksEvent={ noop }
				retryAuth={ noop }
				siteSlug={ '' }
				translate={ identity }
				user={ {} }
				userAlreadyConnected={ false }
			/>
		);

		test( 'should return true for sso', () => {
			const component = shallow( renderableComponent );
			component.instance().isSso = () => true;
			const result = component.instance().shouldAutoAuthorize();

			expect( result ).toBe( true );
		} );

		test( 'should return true for woo', () => {
			const component = shallow( renderableComponent );
			component.instance().isWoo = () => true;
			const result = component.instance().shouldAutoAuthorize();

			expect( result ).toBe( true );
		} );
	} );
} );
