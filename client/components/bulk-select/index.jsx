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
		if ( this.hasSomeElementsSelected() ) {
			return <Gridicon className="bulk-select__some-checked-icon" icon="minus-small" size={ 18 }/>;
		}
	},

	hasAllElementsSelected() {
		return this.props.selectedElements && this.props.selectedElements === this.props.totalElements;
	},

	hasSomeElementsSelected() {
		return this.props.selectedElements && this.props.selectedElements < this.props.totalElements;
	},

	handleToggleAll() {
		const newCheckedState = ! ( this.hasSomeElementsSelected() || this.hasAllElementsSelected() );
		this.props.onToggle( newCheckedState );
	},

	render() {
		return (
			<span className="bulk-select" onClick={ this.handleToggleAll }>
				<span className="bulk-select__container">
					<input type="checkbox" className="bulk-select__box" checked={ this.hasAllElementsSelected() } readOnly />
					<Count count={ this.props.selectedElements } />
					{ this.getStateIcon() }
				</span>
			</span>
		);
	}
} );
