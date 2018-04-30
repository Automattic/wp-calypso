/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Count from 'components/count';

export default class extends React.Component {
	static displayName = 'BulkSelect';

	static propTypes = {
		id: PropTypes.string,
		totalElements: PropTypes.number.isRequired,
		selectedElements: PropTypes.number.isRequired,
		onToggle: PropTypes.func.isRequired,
	};

	getStateIcon = () => {
		if ( this.hasSomeElementsSelected() ) {
			return <Gridicon className="bulk-select__some-checked-icon" icon="minus-small" size={ 18 } />;
		}
	};

	hasAllElementsSelected = () => {
		return this.props.selectedElements && this.props.selectedElements === this.props.totalElements;
	};

	hasSomeElementsSelected = () => {
		return this.props.selectedElements && this.props.selectedElements < this.props.totalElements;
	};

	handleToggleAll = () => {
		const newCheckedState = ! ( this.hasSomeElementsSelected() || this.hasAllElementsSelected() );
		this.props.onToggle( newCheckedState );
	};

	render() {
		const isChecked = this.hasAllElementsSelected();
		const inputClasses = classNames( 'bulk-select__box', {
			// We need to add this CSS class to be able to test if the input if checked,
			// since Enzyme still doesn't support :checked pseudoselector.
			'is-checked': isChecked,
		} );
		const inputProps = {
			className: inputClasses,
			checked: isChecked,
		};
		if ( this.props.id ) {
			inputProps.id = this.props.id;
		}

		return (
			<span className="bulk-select">
				<span className="bulk-select__container">
					<input type="checkbox" { ...inputProps } onChange={ this.handleToggleAll } />
					<Count count={ this.props.selectedElements } />
					{ this.getStateIcon() }
				</span>
			</span>
		);
	}
}
