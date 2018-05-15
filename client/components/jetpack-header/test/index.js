/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { identity } from 'lodash';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { JetpackHeader } from '..';
import JetpackLogo from 'components/jetpack-logo';

describe( 'JetpackHeader', () => {
	test( 'renders Jetpack logo when no partnerSlug prop', () => {
		const wrapper = shallow( <JetpackHeader translate={ identity } /> );
		expect( wrapper.find( JetpackLogo ) ).toHaveLength( 1 );
	} );

	test( 'should render Jetpack logo when passed empty string for partnerSlug prop', () => {
		const wrapper = shallow( <JetpackHeader partnerSlug="" translate={ identity } /> );
		expect( wrapper.find( JetpackLogo ) ).toHaveLength( 1 );
	} );

	test( 'should render JetpackLogo when passed an unknown partner slug', () => {
		const wrapper = shallow( <JetpackHeader partnerSlug="nonexistent" translate={ identity } /> );
		expect( wrapper.find( JetpackLogo ) ).toHaveLength( 1 );
	} );

	test( 'should render a co-branded logo when passed a known partner slug', () => {
		const wrapper = shallow( <JetpackHeader partnerSlug="dreamhost" translate={ identity } /> );
		expect( wrapper.find( '.jetpack-connect-header-logo__cobranded-logo' ) ).toHaveLength( 1 );
	} );
} );
