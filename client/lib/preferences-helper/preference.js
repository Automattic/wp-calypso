/**
 * External dependencies
 */
import React, { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { isPlainObject } from 'lodash';

/**
 * Internal dependencies
 */
import { savePreference } from 'calypso/state/preferences/actions';
import ArrayPreference from './array-preference';
import ObjectPreference from './object-preference';
import BooleanPreference from './boolean-preference';
import StringPreference from './string-preference';
import NumberPreference from './number-preference';

const Preference = ( { name, value } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const preferenceHandler = useMemo( () => {
		if ( Array.isArray( value ) ) {
			return <ArrayPreference name={ name } value={ value } />;
		}

		if ( isPlainObject( value ) ) {
			return <ObjectPreference name={ name } value={ value } />;
		}

		if ( 'string' === typeof value ) {
			return <StringPreference name={ name } value={ value } />;
		}

		if ( 'boolean' === typeof value ) {
			return <BooleanPreference name={ name } value={ value } />;
		}

		if ( 'number' === typeof value ) {
			return <NumberPreference name={ name } value={ value } />;
		}

		return (
			<ul>
				<li key={ name }>{ value.toString() } </li>
			</ul>
		);
	}, [ name, value ] );

	const unsetPreference = useCallback( () => dispatch( savePreference( name, null ) ), [
		dispatch,
		name,
	] );

	return (
		<div>
			<div className="preferences-helper__preference-header">
				<button
					className="preferences-helper__unset"
					onClick={ unsetPreference }
					title={ translate( 'Unset Preference' ) }
				>
					{ 'X' }
				</button>
				<span>{ name }</span>
			</div>
			{ preferenceHandler }
		</div>
	);
};

export default Preference;
