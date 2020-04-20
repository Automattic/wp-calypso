/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */

import translatableString from '../proptype';

function assertPasses( validator, { props }, propName = 'translatableString' ) {
	expect( validator( props, 'translatableString', propName ) ).toBeNull();
}

function assertFails( validator, { props }, propName = 'translatableString' ) {
	expect( validator( props, propName ) ).toBeInstanceOf( Error );
}

const Translatable = () => <span />;
const LocalizedTranslatable = localize( Translatable );

describe( 'translatable proptype', () => {
	test( 'should pass when no propType Name declared', () => {
		assertPasses( translatableString, <legend />, '' );
	} );

	test( 'should pass with string ', () =>
		assertPasses( translatableString, <legend translatableString={ 'Los pollos hermanos' } /> ) );

	test( 'should pass with <Translatable /> component ', () =>
		assertPasses( translatableString, <legend translatableString={ <Translatable /> } /> ) );

	test( 'should pass on <data /> object', () =>
		assertPasses( translatableString, Object.assign( {}, <data /> ) ) );

	test( 'should pass on nil/false values', () => {
		assertPasses( translatableString, <legend translatableString={ null } /> );
		assertPasses( translatableString, <legend translatableString={ undefined } /> );
	} );

	test( 'should fail on numbers', () => {
		assertFails( translatableString, <legend translatableString={ 0 } /> );
		assertFails( translatableString, <legend translatableString={ 2 } /> );
	} );

	test( 'should fail on unexpected functions', () =>
		assertFails( translatableString, <legend translatableString={ function () {} } /> ) );

	test( 'should fail on unexpected objects', () =>
		assertFails( translatableString, <legend translatableString={ {} } /> ) );

	it( 'should pass with valid value when required', () => {
		assertPasses(
			translatableString.isRequired,
			<legend translatableString={ <Translatable /> } />
		);
		assertPasses(
			translatableString.isRequired,
			<legend translatableString={ 'Los pollos hermanos' } />
		);
	} );

	it( 'should fail when required', () => assertFails( translatableString.isRequired, <legend /> ) );

	it( 'should pass with <Translatable> component run through i18n-calypso.localize()', () =>
		assertPasses(
			translatableString.isRequired,
			<legend translatableString={ <LocalizedTranslatable /> } />
		) );
} );
