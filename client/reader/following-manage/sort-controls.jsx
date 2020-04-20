/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormSelect from 'components/forms/form-select';

class FollowingManageSortControls extends React.Component {
	static propTypes = {
		onSortChange: PropTypes.func,
		sortOrder: PropTypes.oneOf( [ 'date-followed', 'alpha' ] ),
	};

	static defaultProps = {
		onSortChange: noop,
		sortOrder: 'date-followed',
	};

	handleSelectChange = ( event ) => {
		this.props.onSortChange( event.target.value );
	};

	render() {
		const sortOrder = this.props.sortOrder;

		return (
			<FormSelect
				className="following-manage__sort-controls"
				onChange={ this.handleSelectChange }
				value={ sortOrder }
			>
				<option value="date-followed">{ this.props.translate( 'Sort by date followed' ) }</option>
				<option value="alpha">{ this.props.translate( 'Sort by site name' ) }</option>
			</FormSelect>
		);
	}
}

export default localize( FollowingManageSortControls );
