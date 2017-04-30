
/**
 * External dependencies
 */
import React from 'react';
import { noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormSelect from 'components/forms/form-select';

class FollowingManageSortControls extends React.Component {

	static propTypes = {
		onSelectChange: React.PropTypes.func,
		sortOrder: React.PropTypes.oneOf( [ 'date-followed', 'alpha' ] ),
	}

	static defaultProps = {
		onSelectChange: noop,
		sortOrder: 'date-followed',
	}

	handleSelectChange = ( event ) => {
		this.props.onSelectChange( event.target.value );
	}

	render() {
		const sortOrder = this.props.sortOrder;

		return (
			<FormSelect className="following-manage__sort-controls" onChange={ this.handleSelectChange } value={ sortOrder }>
				<option value="date-followed">{ this.props.translate( 'Sort by date' ) }</option>
				<option value="alpha">{ this.props.translate( 'Sort by name' ) }</option>
			</FormSelect>
		);
	}
}

export default localize( FollowingManageSortControls );
