/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import { RegistrantExtraInfoCaForm } from '../ca-form';

jest.mock( 'store', () => ( { get: () => {}, set: () => {} } ) );
jest.mock( 'lib/analytics', () => {} );

const mockProps = {
	translate: identity,
	updateContactDetailsCache: identity,
	userWpcomLang: 'EN',
	getFieldProps: () => ( {} ),
};

describe( 'ca-form', () => {
	test( 'should render without errors when extra is empty', () => {
		const testProps = {
			...mockProps,
			contactDetails: {},
		};

		shallow( <RegistrantExtraInfoCaForm { ...testProps } /> );
	} );
} );
