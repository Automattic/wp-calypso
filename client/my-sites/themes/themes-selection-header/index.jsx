/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';

/**
 * Style dependencies
 */
import './style.scss';

const ThemesSelectionHeader = ( { label, source } ) => {
	const translate = useTranslate();

	const classes = classNames( 'themes__themes-selection-header', `source-${ source }` );

	return (
		<div className={ classes }>
			<h2>
				<strong>{ label || translate( 'WordPress.com themes' ) }</strong>
			</h2>
		</div>
	);
};

ThemesSelectionHeader.propTypes = {
	label: PropTypes.string,
	count: PropTypes.number,
};

export default ThemesSelectionHeader;
