/**
 * External dependencies
 */
import React from 'react';
import { Keyframes, animated } from 'react-spring/renderprops';

export default function() {
	const AnimScanIconShield = Keyframes.Spring( async next => {
		// eslint-disable-next-line no-constant-condition
		while ( true ) {
			await next( {
				from: { opacity: 0 },
				opacity: 1,
				config: { duration: 900 },
			} );
			await next( {
				opacity: 0,
				config: { duration: 900 },
			} );
		}
	} );

	const AnimScanIconHead = Keyframes.Spring( async next => {
		// eslint-disable-next-line no-constant-condition
		while ( true ) {
			await next( {
				from: { transform: 'translateY(0px)' },
				transform: 'translateY(260px)',
				config: { duration: 1800 },
			} );
			await next( {
				transform: 'translateY(0px)',
				config: { duration: 0 },
			} );
		}
	} );

	return (
		<div>
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
					<AnimScanIconShield native>
						{ props => (
							<animated.rect style={ props } x="0" y="0" width="124" height="150" fill="#D0E6B8" />
						) }
					</AnimScanIconShield>
					<AnimScanIconHead native>
						{ props => (
							<animated.line
								style={ props }
								x1="0"
								x2="124"
								y1="0"
								y2="0"
								stroke="#069E08"
								strokeWidth="7"
							/>
						) }
					</AnimScanIconHead>
				</g>
			</svg>
		</div>
	);
}
