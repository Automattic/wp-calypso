/**
 * External dependencies
 */
import React from 'react';
import debugModule from 'debug';
import noop from 'lodash/utility/noop';

/**
 * Module variables
 */
//const debug = debugModule( 'calypso:reader:following-edit:sort' );

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
			<div className="following-edit-sort-controls">
				<label htmlFor="sort-control-select">{ this.translate( 'Sort by' ) }</label>
				<select id="sort-control-select" ref="sortControlSelect" className="is-compact" onChange={ this.handleSelectChange } value={ sortOrder }>
					<option value="date-followed">{ this.translate( 'Sort by Date' ) }</option>
					<option value="alpha">{ this.translate( 'Sort by Name' ) }</option>
				</select>
			</div>
		);
	}
} );

export default FollowingEditSortControls;
