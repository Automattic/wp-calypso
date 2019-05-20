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
import { preventWidows } from 'lib/formatting';

/**
 * Style dependencies
 */
import './style.scss';

function FormattedHeader( { id, headerText, subHeaderText, className } ) {
	const classes = classNames( 'formatted-header', className, {
		'is-without-subhead': ! subHeaderText,
	} );

	return (
		<header id={ id } className={ classes }>
			<h1 className="formatted-header__title">{ preventWidows( headerText, 2 ) }</h1>
			{ subHeaderText && (
				<p className="formatted-header__subtitle">{ preventWidows( subHeaderText, 2 ) }</p>
			) }
		</header>
	);
}

FormattedHeader.propTypes = {
	headerText: PropTypes.node,
	subHeaderText: PropTypes.node,
};

export default FormattedHeader;
