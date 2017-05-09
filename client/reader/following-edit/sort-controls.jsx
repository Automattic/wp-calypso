/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import noop from 'lodash/noop';

/**
 * Module variables
 */

const FollowingEditSortControls = React.createClass( {

	propTypes: {
		onSelectChange: React.PropTypes.func,
		sortOrder: React.PropTypes.string
	},

	getDefaultProps() {
		return {
			onSelectChange: noop,
		};
	},

	handleSelectChange( event ) {
		this.props.onSelectChange( event.target.value );
	},

	render() {
		const sortOrder = this.props.sortOrder;

		return (
		    <div className="following-edit__sort-controls">
				<label htmlFor="sort-control-select">{ this.props.translate( 'Sort by' ) }</label>
				<select id="sort-control-select" ref="sortControlSelect" className="is-compact" onChange={ this.handleSelectChange } value={ sortOrder }>
					<option value="date-followed">{ this.props.translate( 'By Date' ) }</option>
					<option value="alpha">{ this.props.translate( 'By Name' ) }</option>
				</select>
			</div>
		);
	}
} );

export default localize( FollowingEditSortControls );
