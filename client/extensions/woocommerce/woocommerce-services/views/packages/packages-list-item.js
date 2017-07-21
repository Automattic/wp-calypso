/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { translate as __ } from 'i18n-calypso';
import _ from 'lodash';
import Gridicon from 'gridicons';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Checkbox from 'components/checkbox';

const renderIcon = ( isLetter, isError, onClick ) => {
	let icon;
	if ( isError ) {
		icon = 'notice';
	} else {
		icon = isLetter ? 'mail' : 'product';
	}

	const gridicon = <Gridicon icon={ icon } className="package-type-icon" size={ isError ? 29 : 18 } />;
	if ( ! onClick ) {
		return gridicon;
	}

	return (
		<a href="#" onClick={ onClick }>{ gridicon }</a>
	);
};

const renderName = ( name, openModal ) => {
	const nameEl = name && '' !== _.trim( name )
		? name
		: <span className="package-no-name">{ __( 'Untitled' ) }</span>;

	if ( ! openModal ) {
		return nameEl;
	}

	return ( <a href="#" onClick={ openModal }>{ nameEl }</a> );
};

const renderSelect = ( selected, onToggle ) => {
	return (
		<div className="package-actions">
			<Checkbox checked={ selected } onChange={ onToggle } />
		</div>
	);
};

const renderActions = ( onRemove ) => {
	return (
		<div className="package-actions">
			<Button compact borderless className="remove-package" onClick={ onRemove }>
				<Gridicon icon="cross-small" size={ 18 } />
			</Button>
		</div>
	);
};

const PackagesListItem = ( {
	index,
	data,
	dimensionUnit,
	editable,
	selected,
	onToggle,
	onRemove,
	editPackage,
	hasError,
} ) => {
	const openModal = editable ? ( event ) => {
		event.preventDefault();
		editPackage( Object.assign( {}, data, { index } ) );
	} : null;

	return (
		<div className={ classNames( 'wcc-shipping-packages-list-item', { 'wcc-error': hasError } ) }>
			{ editable ? null : renderSelect( selected, onToggle ) }
			<div className="package-type">
				{ renderIcon( data.is_letter, hasError, openModal ) }
			</div>
			<div className="package-name">
				{ renderName( data.name, openModal ) }
			</div>
			<div className="package-dimensions">
				<span>{ data.inner_dimensions } { dimensionUnit }</span>
			</div>
			{ editable ? renderActions( onRemove ) : null }
		</div>
	);
};

PackagesListItem.propTypes = {
	index: PropTypes.number.isRequired,
	data: PropTypes.shape( {
		name: PropTypes.string,
		is_letter: PropTypes.bool,
		inner_dimensions: PropTypes.string,
	} ).isRequired,
	editable: PropTypes.bool.isRequired,
	selected: PropTypes.bool,
	dimensionUnit: PropTypes.string.isRequired,
	onToggle: PropTypes.func,
	onRemove: PropTypes.func,
	editPackage: PropTypes.func,
};

export default PackagesListItem;
