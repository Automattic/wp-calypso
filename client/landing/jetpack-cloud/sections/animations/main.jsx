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

	const animScanIconShield = useSpring( {
		from: { opacity: 0 },
		to: async next => {
			for (;;) {
				await next( { opacity: 1 } );
			}
		},
		config: { duration: 900 },
		reset: true,
	} );

	const animScanIconHead = useSpring( {
		from: { transform: 'translateY(0px)' },
		to: async next => {
			for (;;) {
				await next( { transform: 'translateY(260px)' } );
			}
		},
		config: { duration: 1800 },
		reset: true,
	} );

	return (
		<div>
			<animated.p style={ animHello }>Welcome to the animated world of icons, { user }!</animated.p>

			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 124 150"
				className="animations__jpc-icon"
			>
				<mask id="scan-shield-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="124" height="150">
					<path
						d="M62.115 0L.75 27.273v40.909c0 37.841 26.182 73.227 61.364 81.818 35.181-8.591 61.363-43.977 61.363-81.818v-40.91L62.115 0z"
						fill="#FFF"
					/>
				</mask>
				<g mask="url(#scan-shield-mask)">
					<animated.rect
						style={ animScanIconShield }
						x="0"
						y="0"
						width="124"
						height="150"
						fill="#D0E6B8"
					/>
					<animated.line
						style={ animScanIconHead }
						x1="0"
						x2="124"
						y1="0"
						y2="0"
						stroke="#069E08"
						strokeWidth="7"
					/>
				</g>
			</svg>
		</div>
	);
}
