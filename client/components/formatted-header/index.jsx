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
import { preventWidows } from 'client/lib/formatting';

function FormattedHeader( { headerText, subHeaderText } ) {
	const classes = classNames( 'formatted-header', {
		'is-without-subhead': ! subHeaderText,
	} );

	return (
		<header className={ classes }>
			<h1 className="formatted-header__title">{ preventWidows( headerText, 2 ) }</h1>
			{ subHeaderText && (
				<p className="formatted-header__subtitle">{ preventWidows( subHeaderText, 2 ) }</p>
			) }
		</header>
	);
}

FormattedHeader.propTypes = {
	headerText: PropTypes.oneOfType( [ PropTypes.string, PropTypes.array ] ),
	subHeaderText: PropTypes.node,
};

export default FormattedHeader;
