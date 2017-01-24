/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { map, toPairs } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import QueryTimezones from 'components/data/query-timezones';
import { timezonesRequestAction as requestTimezones } from 'state/timezones/actions';
import {
	getRawOffsets,
	getTimezones,
} from 'state/selectors';

/**
 * Module variables
 */
const noop = () => {};

class Timezone extends Component {
	static propTypes = {
		selectedZone: PropTypes.string,
		onSelect: PropTypes.func
	};

	static defaultProps = {
		selectedZone: '',
		onSelect: noop
	};

	selectTimezone = ( { target } ) => {
		this.props.onSelect( target.value );
	}

	renderTimezones() {
		const { timezones } = this.props;

		return (
			map( timezones, continent =>
				<optgroup label={ continent[ 0 ] } key={ continent[ 0 ] }>
					{ map( continent[ 1 ], ( zone, index ) =>
						<option value={ zone[ 0 ] } key={ index }>{ zone[ 1 ] }</option>
					) }
				</optgroup>
			)
		);
	}

	renderRawOffsets() {
		const { rawOffsets } = this.props;
		return (
			<optgroup label={ this.props.translate( 'Manual Offsets' ) }>
				{ map( toPairs( rawOffsets ), ( zone, index ) =>
					<option value={ zone[ 0 ] } key={ index }>{ zone[ 1 ] }</option>
				) }
			</optgroup>
		);
	}

	render() {
		const { selectedZone } = this.props;

		return (
			<div>
				<QueryTimezones />
				<select onChange={ this.selectTimezone } value={ selectedZone }>
					{ this.renderTimezones() }
					<optgroup label="UTC">
						<option value="UTC">UTC</option>
					</optgroup>
					{ this.renderRawOffsets() }
				</select>
			</div>
		);
	}
}

/**
 * - Component-Data connection.
 * - Localize
 */

const mapStateToProps = state => ( {
	rawOffsets: getRawOffsets( state ),
	timezones: getTimezones( state ),
} );

const mapDispatchToProps = { requestTimezones };

export default connect( mapStateToProps, mapDispatchToProps )( localize( Timezone ) );
