/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { trim } from 'lodash';
import Gridicon from 'components/gridicon';
import classNames from 'classnames';

const PackagesListItem = ( {
	isPlaceholder,
	data,
	dimensionUnit,
	prefixActions,
	hasError,
	children,
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
				<div className="packages__packages-row-actions">{ children }</div>
			</div>
		);
	}

	const renderIcon = ( isLetter ) => {
		const icon = isLetter ? 'mail' : 'product';

		return <Gridicon icon={ icon } size={ 18 } />;
	};

	const renderName = ( name ) => {
		return name && '' !== trim( name ) ? name : translate( 'Untitled' );
	};

	const renderActions = () => <div className="packages__packages-row-actions">{ children }</div>;

	return (
		<div className={ classNames( 'packages__packages-row', { prefixed: prefixActions } ) }>
			{ prefixActions ? renderActions() : null }
			<div className="packages__packages-row-icon">{ renderIcon( data.is_letter, hasError ) }</div>
			<div className="packages__packages-row-details">
				<div className="packages__packages-row-details-name">
					{ renderName( data.name, translate ) }
				</div>
			</div>
			<div className="packages__packages-row-dimensions">
				{ data.inner_dimensions } { dimensionUnit }
			</div>
			{ prefixActions ? null : renderActions() }
		</div>
	);
};

PackagesListItem.propTypes = {
	siteId: PropTypes.number.isRequired,
	isPlaceholder: PropTypes.bool,
	data: PropTypes.shape( {
		name: PropTypes.string,
		is_letter: PropTypes.bool,
		inner_dimensions: PropTypes.string,
	} ).isRequired,
	prefixActions: PropTypes.bool,
	dimensionUnit: PropTypes.string,
};

export default localize( PackagesListItem );
