/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { preventWidows } from 'calypso/lib/formatting';

/**
 * Style dependencies
 */
import './style.scss';

function FormattedHeader( {
	brandFont,
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

	const headerClasses = classNames( 'formatted-header__title', { 'wp-brand-font': brandFont } );

	return (
		<header id={ id } className={ classes }>
			{ ! isSecondary && <h1 className={ headerClasses }>{ preventWidows( headerText, 2 ) }</h1> }
			{ isSecondary && <h2 className={ headerClasses }>{ preventWidows( headerText, 2 ) }</h2> }
			{ subHeaderText && (
				<p className="formatted-header__subtitle">{ preventWidows( subHeaderText, 2 ) }</p>
			) }
		</header>
	);
}

FormattedHeader.propTypes = {
	id: PropTypes.string,
	className: PropTypes.string,
	brandFont: PropTypes.bool,
	headerText: PropTypes.oneOfType( [ PropTypes.node, PropTypes.string ] ).isRequired,
	subHeaderText: PropTypes.oneOfType( [ PropTypes.node, PropTypes.string ] ),
	compactOnMobile: PropTypes.bool,
	isSecondary: PropTypes.bool,
	align: PropTypes.oneOf( [ 'center', 'left', 'right' ] ),
};

FormattedHeader.defaultProps = {
	id: '',
	className: '',
	brandFont: false,
	subHeaderText: '',
	compactOnMobile: false,
	isSecondary: false,
	align: 'center',
};

export default FormattedHeader;
