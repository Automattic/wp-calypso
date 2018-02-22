/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { partial, isArray } from 'lodash';

/**
 * Internal dependencies
 */
import { savePreference } from 'state/preferences/actions';

class Preference extends Component {
	render() {
		const { name, value, translate, unsetPreference } = this.props;
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
				<ul className="preferences-helper__list">
					{ isArray( value ) ? (
						value.map( ( preference, index ) => <li key={ index }>{ preference }</li> )
					) : (
						<li key={ 0 }>{ value.toString() }</li>
					) }
				</ul>
			</div>
		);
	}
}

export default connect( null, {
	unsetPreference: savePreference,
} )( localize( Preference ) );
