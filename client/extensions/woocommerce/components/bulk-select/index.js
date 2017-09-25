/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React from 'react';

const BulkSelect = ( { totalElements, selectedElements, className, disabled, readOnly, onToggle } ) => {
	const hasAllElementsSelected = selectedElements && selectedElements === totalElements;
	const hasSomeElementsSelected = selectedElements && selectedElements < totalElements;
	const inputClasses = classNames( 'bulk-select__box', { 'is-checked': hasAllElementsSelected } );
	const iconClasses = classNames( 'bulk-select__some-checked-icon', { 'is-disabled': disabled } );
	const containerClasses = classNames( 'bulk-select', className );
	const handleToggle = ( event ) => {
		if ( readOnly ) {
			return;
		}
		const newCheckedState = ! ( hasSomeElementsSelected || hasAllElementsSelected );
		onToggle( newCheckedState, event );
	};

	return (
		<span className={ containerClasses } onClick={ handleToggle }>
			<span className="bulk-select__container">
				<input
					type="checkbox"
					className={ inputClasses }
					checked={ hasAllElementsSelected }
					disabled={ disabled }
					readOnly />
				{ hasSomeElementsSelected ? <Gridicon
					className={ iconClasses }
					icon="minus-small"
					size={ 18 } /> : null }
			</span>
		</span>
	);
};

BulkSelect.propTypes = {
	totalElements: PropTypes.number.isRequired,
	selectedElements: PropTypes.number.isRequired,
	onToggle: PropTypes.func,
	readOnly: PropTypes.bool,
	className: PropTypes.string,
	disabled: PropTypes.bool,
};

export default BulkSelect;
