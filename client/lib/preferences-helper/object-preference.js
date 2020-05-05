/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

class ObjectPreference extends Component {
	static propTypes = {
		name: PropTypes.string.isRequired,
		value: PropTypes.object.isRequired,
	};

	render() {
		const { value } = this.props;

		return (
			<ul className="preferences-helper__list">
				{ Object.keys( value ).map( ( property ) => (
					<li key={ property }>{ property + ': ' + JSON.stringify( value[ property ] ) }</li>
				) ) }
			</ul>
		);
	}
}

export default connect( null, null )( localize( ObjectPreference ) );
