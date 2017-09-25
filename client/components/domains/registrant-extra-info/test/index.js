/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import RegistrantExtraInfoCaForm from '../ca-form';
import RegistrantExtraInfoFrForm from '../fr-form';
import RegistrantExtraInfoForm from '../index';

describe( 'Switcher Form', function() {
	it( 'should render correct form for fr', () => {
		const wrapper = shallow(
			<RegistrantExtraInfoForm
				tld="fr" />
		);

		expect( wrapper.find( RegistrantExtraInfoFrForm ) ).to.have.length( 1 );
		expect( wrapper.find( RegistrantExtraInfoCaForm ) ).to.have.length( 0 );
	} );

	it( 'should render correct form for ca', () => {
		const wrapper = shallow(
			<RegistrantExtraInfoForm
				tld="ca" />
		);

		expect( wrapper.find( RegistrantExtraInfoCaForm ) ).to.have.length( 1 );
		expect( wrapper.find( RegistrantExtraInfoFrForm ) ).to.have.length( 0 );
	} );
} );
