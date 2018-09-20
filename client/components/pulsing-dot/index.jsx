/** @format */

/**
 * External dependencies
 */

import React from 'react';
import classnames from 'classnames';

export default function PulsingDot( { active } ) {
	const className = classnames( 'pulsing-dot', { 'is-active': active } );
	return <div className={ className } />;
}
