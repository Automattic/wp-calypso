/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { partial, isPlainObject } from 'lodash';

/**
 * Internal dependencies
 */
import { savePreference } from 'calypso/state/preferences/actions';
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

		if ( Array.isArray( value ) ) {
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
			<tr>
				<td className="preference__unset">
					<button
						onClick={ partial( unsetPreference, name, null ) }
						title={ translate( 'Unset Preference' ) }
					>
						<span role="img" aria-label={ translate( 'Unset Preference' ) }>
							&#10060;
						</span>
					</button>
				</td>
				<td className="preference__name">{ name }</td>
				<td className="preference__value">{ preferenceHandler }</td>
			</tr>
		);
	}
}

export default connect( null, {
	unsetPreference: savePreference,
} )( localize( Preference ) );
