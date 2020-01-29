/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { preventWidows } from 'lib/formatting';

/**
 * Style dependencies
 */
import './style.scss';

function FormattedHeader( {
	id,
	headerText,
	subHeaderText,
	className,
	compactOnMobile,
	align,
	isSecondary,
} ) {
	const classes = classNames( 'formatted-header', className, {
		'is-without-subhead': ! subHeaderText,
		'is-compact-on-mobile': compactOnMobile,
		'is-left-align': 'left' === align,
		'is-right-align': 'right' === align,
	} );

	return (
		<header id={ id } className={ classes }>
			{ ! isSecondary && (
				<h1 className="formatted-header__title">{ preventWidows( headerText, 2 ) }</h1>
			) }
			{ isSecondary && (
				<h2 className="formatted-header__title">{ preventWidows( headerText, 2 ) }</h2>
			) }
			{ subHeaderText && (
				<p className="formatted-header__subtitle">{ preventWidows( subHeaderText, 2 ) }</p>
			) }
		</header>
	);
}

FormattedHeader.propTypes = {
	headerText: PropTypes.node,
	subHeaderText: PropTypes.node,
	compactOnMobile: PropTypes.bool,
	isSecondary: PropTypes.bool,
	align: PropTypes.string,
};

export default FormattedHeader;
