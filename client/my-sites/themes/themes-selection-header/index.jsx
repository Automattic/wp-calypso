/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';

const ThemesSelectionHeader = ( { label, count, translate } ) => {
	const selectionHeaderClassName = classNames( 'themes-selection-header', {
		'is-placeholder': count === null,
	} );

	return (
		<div className={ selectionHeaderClassName }>
			<SectionHeader
				label={ label || translate( 'WordPress.com themes' ) }
				count={ count } />
		</div>
	);
};

ThemesSelectionHeader.propTypes = {
	label: PropTypes.string,
	count: PropTypes.number
};

export default localize( ThemesSelectionHeader );
