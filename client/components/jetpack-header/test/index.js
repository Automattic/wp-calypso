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
import { JetpackHeader } from '..';
import JetpackLogo from 'components/jetpack-logo';

describe( 'JetpackHeader', () => {
	test( 'renders Jetpack logo when no partnerSlug prop', () => {
		const wrapper = shallow( <JetpackHeader /> );
		expect( wrapper.find( JetpackLogo ) ).toHaveLength( 1 );
	} );

	test( 'should render Jetpack logo when passed empty string for partnerSlug prop', () => {
		const wrapper = shallow( <JetpackHeader partnerSlug="" /> );
		expect( wrapper.find( JetpackLogo ) ).toHaveLength( 1 );
	} );

	test( 'should render JetpackLogo when passed an unknown partner slug', () => {
		const wrapper = shallow( <JetpackHeader partnerSlug="nonexistent" /> );
		expect( wrapper.find( JetpackLogo ) ).toHaveLength( 1 );
	} );

	test( 'should render a co-branded logo when passed a known partner slug', () => {
		const wrapper = shallow( <JetpackHeader partnerSlug="dreamhost" translate={ noop } /> );
		expect( wrapper.find( '.jetpack-connect-header-logo__cobranded-logo' ) ).toHaveLength( 1 );
	} );
} );
