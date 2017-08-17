/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { trim } from 'lodash';
import Gridicon from 'gridicons';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FormCheckbox from 'components/forms/form-checkbox';

const renderIcon = ( isLetter, isError ) => {
	let icon;
	if ( isError ) {
		icon = 'notice';
	} else {
		icon = isLetter ? 'mail' : 'product';
	}

	return <Gridicon icon={ icon } size={ 18 } />;
};

const renderName = ( name, translate ) => {
	return name && '' !== trim( name )
		? name
		: translate( 'Untitled' );
};

const renderSelect = ( selected, onToggle ) => {
	return (
		<div className="packages__packages-row-actions">
			<FormCheckbox checked={ selected } onChange={ onToggle } />
		</div>
	);
};

const renderActions = ( openModal, translate ) => {
	return (
		<div className="packages__packages-row-actions">
			<Button compact onClick={ openModal }>{ translate( 'Edit' ) }</Button>
		</div>
	);
};

const PackagesListItem = ( {
	siteId,
	isPlaceholder,
	index,
	data,
	dimensionUnit,
	editable,
	selected,
	onToggle,
	editPackage,
	hasError,
	translate,
} ) => {
	if ( isPlaceholder ) {
		return (
			<div className="packages__packages-row placeholder">
				<div className="packages__packages-row-icon">
					<Gridicon icon="product" size={ 18 } />
				</div>
				<div className="packages__packages-row-details">
					<div className="packages__packages-row-details-name">
						<span />
					</div>
				</div>
				<div className="packages__packages-row-dimensions">
					<span />
				</div>
				<div className="packages__packages-row-actions">
					<Button compact>{ translate( 'Edit' ) }</Button>
				</div>
			</div>
		);
	}

	const openModal = editable ? ( event ) => {
		event.preventDefault();
		editPackage( siteId, Object.assign( {}, data, { index } ) );
	} : null;

	return (
		<div className={ classNames( 'packages__packages-row', { selectable: ! editable, error: hasError } ) }>
			{ editable ? null : renderSelect( selected, onToggle ) }
			<div className="packages__packages-row-icon">
				{ renderIcon( data.is_letter, hasError ) }
			</div>
			<div className="packages__packages-row-details">
				<div className="packages__packages-row-details-name">{ renderName( data.name, translate ) }</div>
			</div>
			<div className="packages__packages-row-dimensions">{ data.inner_dimensions } { dimensionUnit }</div>
			{ editable ? renderActions( openModal, translate ) : null }
		</div>
	);
};

PackagesListItem.propTypes = {
	siteId: PropTypes.number.isRequired,
	isPlaceholder: PropTypes.bool,
	index: PropTypes.number.isRequired,
	data: PropTypes.shape( {
		name: PropTypes.string,
		is_letter: PropTypes.bool,
		inner_dimensions: PropTypes.string,
	} ).isRequired,
	editable: PropTypes.bool.isRequired,
	selected: PropTypes.bool,
	dimensionUnit: PropTypes.string,
	onToggle: PropTypes.func,
	editPackage: PropTypes.func,
};

export default localize( PackagesListItem );
