/**
 * External dependencies
 */

import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import identity from 'lodash/identity';

/**
 * Internal dependencies
 */
import { RoleSelect } from '..';
import FormFieldset from 'components/forms/form-fieldset';

describe( 'RoleSelect', function() {
	it( 'renders FormFieldset', function() {
		const wrapper = shallow(
			<RoleSelect
				translate={ identity }
			/>
		);

		expect( wrapper.find( FormFieldset ).length ).to.equal( 1 );
	} );
} );
