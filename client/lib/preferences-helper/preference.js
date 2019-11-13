/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { partial, isArray, isPlainObject } from 'lodash';

/**
 * Internal dependencies
 */
import { savePreference } from 'state/preferences/actions';
import ArrayPreference from './array-preference';
import ObjectPreference from './object-preference';
import BooleanPreference from './boolean-preference';
import StringPreference from './string-preference';
import NumberPreference from './number-preference';

class Preference extends Component {
	render() {
		const { name, value, translate, unsetPreference } = this.props;

		let preferenceHandler = (
			<ul>
				<li key={ name }>{ value.toString() } </li>
			</ul>
		);

		if ( isArray( value ) ) {
			preferenceHandler = <ArrayPreference name={ name } value={ value } />;
		} else if ( isPlainObject( value ) ) {
			preferenceHandler = <ObjectPreference name={ name } value={ value } />;
		} else if ( 'string' === typeof value ) {
			preferenceHandler = <StringPreference name={ name } value={ value } />;
		} else if ( 'boolean' === typeof value ) {
			preferenceHandler = <BooleanPreference name={ name } value={ value } />;
		} else if ( 'number' === typeof value ) {
			preferenceHandler = <NumberPreference name={ name } value={ value } />;
		}

		return (
			<div>
				<div className="preferences-helper__preference-header">
					<button
						className="preferences-helper__unset"
						onClick={ partial( unsetPreference, name, null ) }
						title={ translate( 'Unset Preference' ) }
					>
						{ 'X' }
					</button>
					<span>{ name }</span>
				</div>
				{ preferenceHandler }
			</div>
		);
	}
}

export default connect( null, {
	unsetPreference: savePreference,
} )( localize( Preference ) );
