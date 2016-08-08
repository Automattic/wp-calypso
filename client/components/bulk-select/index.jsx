/**
 * External dependencies
 */
import React from 'react';
/**
 * Internal dependencies
 */
import Count from 'components/count';
import Gridicon from 'components/gridicon';

export default React.createClass( {

	displayName: 'BulkSelect',

	propTypes: {
		totalElements: React.PropTypes.number.isRequired,
		selectedElements: React.PropTypes.number.isRequired,
		onToggle: React.PropTypes.func.isRequired
	},

	getStateIcon() {
		if ( ! this.hasAllElementsSelected() && this.hasSomeElementsSelected() ) {
			return <Gridicon className="bulk-select__some-checked-icon" icon="minus-small" size={ 18 }/>;
		}
	},

	hasAllElementsSelected() {
		return this.props.selectedElements === this.props.totalElements;
	},

	hasSomeElementsSelected() {
		return this.props.selectedElements > 0;
	},

	handleToggleAll() {
		this.props.onToggle( this.hasSomeElementsSelected() );
	},

	render() {
		const isChecked = this.hasAllElementsSelected();

		return (
			<span className="bulk-select" onClick={ this.handleToggleAll }>
				<span className="bulk-select__container">
					<input type="checkbox" checked={ isChecked } readOnly />
					<Count count={ this.props.selectedElements } />
					{ this.getStateIcon() }
				</span>
			</span>
		);
	}
} );
