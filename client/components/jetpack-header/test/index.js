/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import JetpackHeader from '..';
import JetpackLogo from 'components/jetpack-logo';
import JetpackDreamhostLogo from 'components/jetpack-header/dreamhost';

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
		const wrapper = shallow( <JetpackHeader partnerSlug="dreamhost" /> );
		expect( wrapper.find( JetpackDreamhostLogo ) ).toHaveLength( 1 );
	} );
} );
