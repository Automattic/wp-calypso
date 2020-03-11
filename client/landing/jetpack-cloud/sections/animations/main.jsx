/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { useSpring, animated } from 'react-spring';

/**
 * Internal dependencies
 */
import { getCurrentUserName } from 'state/current-user/selectors';

export default function() {
	const user = useSelector( state => getCurrentUserName( state ) );
	const animHello = useSpring( { opacity: 1, from: { opacity: 0 } } );

	return (
		<div>
			<animated.p style={ animHello }>Welcome to the animated world of icons, { user }!</animated.p>

		</div>
	);
}
