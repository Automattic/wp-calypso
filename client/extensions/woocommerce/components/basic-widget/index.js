/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const BasicWidget = ( { buttonLabel, buttonLink, children, className, title } ) => {
	const classes = classNames( { 'basic-widget__container': true }, className );
	const target = '/' === buttonLink.substring( 0, 1 ) ? '_self' : '_blank';
	return (
		<div className={ classes } >
			<h2>{ title }</h2>
			<div className="basic-widget__inner">
				{ children }
			</div>
			<Button
				href={ buttonLink }
				target={ target }>
				{ buttonLabel }
			</Button>
		</div>
	);
};

BasicWidget.propTypes = {
	buttonLabel: PropTypes.string,
	buttonLink: PropTypes.string,
	children: PropTypes.oneOfType( [
		PropTypes.arrayOf( PropTypes.node ),
		PropTypes.node
	] ),
	className: PropTypes.string,
	title: PropTypes.string,
};

export default BasicWidget;
