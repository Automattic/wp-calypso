/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SectionHeader from 'calypso/components/section-header';

/**
 * Style dependencies
 */
import './style.scss';

const ThemesSelectionHeader = ( { label, count } ) => {
	const translate = useTranslate();

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

export default ThemesSelectionHeader;
