/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';
import { localize } from 'i18n-calypso';

/**
 * Style dependencies
 */
import './style.scss';

const ThemesSelectionHeader = ( { label, count, translate } ) => {
	const selectionHeaderClassName = classNames( 'themes-selection-header', {
		'is-placeholder': count === null,
	} );

	return (
		<div className={ selectionHeaderClassName }>
			<SectionHeader label={ label || translate( 'WordPress.com themes' ) } count={ count } />
		</div>
	);
};

ThemesSelectionHeader.propTypes = {
	label: PropTypes.string,
	count: PropTypes.number,
};

export default localize( ThemesSelectionHeader );
