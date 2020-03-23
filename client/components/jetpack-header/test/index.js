/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow, mount } from 'enzyme';

/**
 * Internal dependencies
 */
import { JetpackHeader } from '..';

describe( 'JetpackHeader', () => {
	test( 'renders default Jetpack logo when no partnerSlug prop', () => {
		const wrapper = shallow( <JetpackHeader /> );
		expect( wrapper.children() ).toHaveLength( 1 );
		expect( wrapper.children().name() ).toEqual( 'JetpackLogo' );
		expect( wrapper.find( 'JetpackLogo' ).props().size ).toEqual( 45 );
	} );

	test( 'should render default Jetpack logo when passed empty string for partnerSlug prop', () => {
		const wrapper = shallow( <JetpackHeader partnerSlug="" /> );
		expect( wrapper.children() ).toHaveLength( 1 );
		expect( wrapper.children().name() ).toEqual( 'JetpackLogo' );
		expect( wrapper.find( 'JetpackLogo' ).props().size ).toEqual( 45 );
	} );

	test( 'should render JetpackLogo when passed an unknown partner slug', () => {
		const wrapper = shallow( <JetpackHeader partnerSlug="nonexistent" /> );
		expect( wrapper.children() ).toHaveLength( 1 );
		expect( wrapper.children().name() ).toEqual( 'JetpackLogo' );
		expect( wrapper.find( 'JetpackLogo' ).props().size ).toEqual( 45 );
	} );

	test( 'should render a co-branded logo when passed a known partner slug', () => {
		const wrapper = mount( <JetpackHeader partnerSlug="dreamhost" /> );
		expect( wrapper.find( 'Localized(JetpackPartnerLogoGroup)' ) ).toHaveLength( 1 );
		expect( wrapper.find( 'AsyncLoad' ) ).toHaveLength( 1 );
	} );

	test( 'should override width on JetpackLogo when width provided but no partner slug', () => {
		const wrapper = mount( <JetpackHeader width={ 60 } /> );
		expect( wrapper.find( 'JetpackLogo' ).props().size ).toEqual( 60 );
	} );

	test( 'should override width on logo group when width and known partner slug provided', () => {
		const wrapper = mount( <JetpackHeader width={ 60 } partnerSlug="dreamhost" /> );
		expect( wrapper.find( 'Localized(JetpackPartnerLogoGroup)' ).props().width ).toEqual( 60 );
	} );
} );
