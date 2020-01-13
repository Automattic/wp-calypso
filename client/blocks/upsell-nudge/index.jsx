/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Banner from 'components/banner';

/**
 * Style dependencies
 */
import './style.scss';

export const UpsellNudge = ( { className, ...props } ) => {
	const classes = classnames( 'upsell-nudge', className );

	return <Banner { ...props } className={ classes } />;
};

export default UpsellNudge;
