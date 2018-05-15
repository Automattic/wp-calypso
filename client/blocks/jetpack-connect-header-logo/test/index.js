/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import { noop } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import { JetpackConnectHeaderLogo } from '..';

describe( 'JetpackConnectHeaderLogo', () => {
	test( 'renders Jetpack logo when no partnerSlug prop', () => {
		const wrapper = shallow( <JetpackConnectHeaderLogo /> );
		expect( wrapper.find( 'JetpackLogo' ) ).toHaveLength( 1 );
	} );

	test( 'should render Jetpack logo when passed empty string for partnerSlug prop', () => {
		const wrapper = shallow( <JetpackConnectHeaderLogo partnerSlug="" /> );
		expect( wrapper.find( 'JetpackLogo' ) ).toHaveLength( 1 );
	} );

	test( 'should render JetpackLogo when passed an unknown partner slug', () => {
		const wrapper = shallow( <JetpackConnectHeaderLogo partnerSlug="nonexistent" /> );
		expect( wrapper.find( 'JetpackLogo' ) ).toHaveLength( 1 );
	} );

	test( 'should render a co-branded logo when passed a known partner slug', () => {
		const wrapper = shallow(
			<JetpackConnectHeaderLogo partnerSlug="dreamhost" translate={ noop } />
		);
		expect( wrapper.find( '.jetpack-connect-header-logo__cobranded-logo' ) ).toHaveLength( 1 );
	} );

	test( 'should fall back to using partnerSlugFromQuery prop when partnerSlug prop is empty', () => {
		const wrapper = shallow(
			<JetpackConnectHeaderLogo partnerSlugFromQuery="dreamhost" translate={ noop } />
		);
		expect( wrapper.find( '.jetpack-connect-header-logo__cobranded-logo' ) ).toHaveLength( 1 );
	} );

	test( 'should prefer partnerSlug prop over partnerSlugFromQuery to allow overriding', () => {
		const wrapper = shallow(
			<JetpackConnectHeaderLogo
				partnerSlug="milesweb"
				partnerSlugFromQuery="dreamhost"
				translate={ noop }
			/>
		);

		const logo = wrapper.find( '.jetpack-connect-header-logo__cobranded-logo' );
		expect( logo ).toHaveLength( 1 );
		expect( logo.prop( 'src' ) ).toBe( '/calypso/images/jetpack/jetpack-milesweb-connection.png' );
	} );
} );
