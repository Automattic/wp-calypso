/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const BasicWidget = ( { buttonLabel, buttonLink, onButtonClick, children, className, title } ) => {
	const classes = classNames( { 'basic-widget__container': true }, className );
	const target = buttonLink && '/' !== buttonLink.substring( 0, 1 ) ? '_blank' : '_self';
	return (
		<div className={ classes }>
			<h2>{ title }</h2>
			<div className="basic-widget__inner">{ children }</div>
			<Button onClick={ onButtonClick } href={ buttonLink } target={ target }>
				{ buttonLabel }
			</Button>
		</div>
	);
};

BasicWidget.propTypes = {
	buttonLabel: PropTypes.string,
	buttonLink: PropTypes.string,
	onButtonClick: PropTypes.func,
	className: PropTypes.string,
	title: PropTypes.string,
};

BasicWidget.defaultProps = {
	onButtonClick: noop,
};

export default BasicWidget;
