/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Style dependencies
 */
import './style.scss';

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function rand( min, max ) {
	return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
}

export const emotions = [
	'blush',
	'wink',
	'dreamy',
	'somber',
	'asleep',
	'sad',
	'cool',
	'electric',
];

export function RandomAgentW( { exclude = [] } ) {
	const filteredEmotions = emotions.filter( ( emotion ) => exclude.indexOf( emotion ) === -1 );
	const index = rand( 0, filteredEmotions.length - 1 );

	return <AgentW classes={ filteredEmotions[ index ] } />;
}

const AgentW = ( props ) => {
	return (
		<div className="chat__gravatar chat__agent-w">
			<div className={ props.classes }>
				<svg width="48" height="48" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
					<g className="ears">
						<path
							fill="#87A6BC"
							d="M5.5 2C3.6 2 2 3.6 2 5.5S3.6 9 5.5 9 9 7.4 9 5.5 7.4 2 5.5 2zm37 0C40.6 2 39 3.6 39 5.5S40.6 9 42.5 9 46 7.4 46 5.5 44.4 2 42.5 2z"
						/>

						<g className="default">
							<path
								fill="none"
								stroke="#87A6BC"
								strokeWidth="3"
								strokeMiterlimit="10"
								d="M6 6l18 24L42 6"
							/>
						</g>

						<g className="electric">
							<path
								fill="none"
								stroke="#87A6BC"
								strokeWidth="3"
								strokeMiterlimit="10"
								d="M34.4 12.8l5.2-.3-1.2-5 5.2-.3"
							/>
							<path
								fill="none"
								stroke="#87A6BC"
								strokeWidth="3"
								strokeMiterlimit="10"
								d="M7.6 4.8L6.4 9.9l5.2.2-1.2 5.1"
							/>
						</g>
					</g>

					<g className="head">
						<ellipse fill="#87A6BC" cx="24" cy="28" rx="22" ry="20" />
					</g>

					<g className="mouth">
						<path
							fill="#FED149"
							stroke="#08252E"
							strokeWidth="2"
							strokeLinejoin="round"
							strokeMiterlimit="10"
							d="M23.2 36.1l-2.3-2.5c-.5-.6-.4-1.5.3-1.9 1.8-1 3.9-1 5.7 0 .7.4.8 1.3.3 1.9l-2.3 2.5c-.6.4-1.2.4-1.7 0z"
						/>

						<g className="default">
							<path
								fill="none"
								stroke="#08252E"
								strokeWidth="2"
								strokeLinejoin="bevel"
								strokeMiterlimit="10"
								d="M35.8 36.4c-1.2 2.1-3.4 3.4-6 3.4-2.5 0-4.6-1.3-5.8-3.3-1.2 2-3.4 3.3-5.8 3.3-2.5 0-4.8-1.4-6-3.4"
							/>
							<path
								fill="none"
								stroke="#08252E"
								strokeWidth="2"
								strokeMiterlimit="10"
								d="M34 34l4 5M14 34l-4 5"
							/>
						</g>

						<g className="cool">
							<path
								fill="none"
								stroke="#08252E"
								strokeWidth="2"
								strokeLinejoin="bevel"
								strokeMiterlimit="10"
								d="M29.8 39.9c-2.5 0-4.6-1.3-5.8-3.3-1.2 2-3.4 3.3-5.8 3.3"
							/>
						</g>

						<g className="sad">
							<path
								fill="#08252E"
								d="M28.6 41c0 2.2-2.1 3-4.6 3s-4.6-.8-4.6-3 2.1-3.9 4.6-3.9 4.6 1.7 4.6 3.9z"
							/>
						</g>

						<g className="asleep">
							<path fill="#80D4ED" d="M25 42s0 4 1 4 1-4 1-4h-2z" />
							<path
								fill="#08252E"
								d="M28.1 40.2c0 1.5-1.8 1.8-4.1 1.8s-4.1-.3-4.1-1.8 1.8-2.8 4.1-2.8 4.1 1.2 4.1 2.8z"
							/>
						</g>
					</g>

					<g className="eyes">
						<g className="default">
							<path
								fill="#FFF"
								d="M32 14c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm-16 0c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7z"
							/>
							<path fill="#08252E" d="M28 20h5v5h-5z" />
							<path fill="#08252E" d="M15 20h5v5h-5z" />
						</g>

						<g className="asleep">
							<path
								fill="none"
								stroke="#08252E"
								strokeWidth="2"
								strokeMiterlimit="10"
								d="M29 21.5c0 1.9 1.6 3.5 3.5 3.5s3.5-1.6 3.5-3.5m-24 0c0 1.9 1.6 3.5 3.5 3.5s3.5-1.6 3.5-3.5"
							/>
						</g>

						<g className="dreamy">
							<path
								fill="#FFF"
								d="M32 14c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm-16 0c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7z"
							/>
							<path
								fill="#08252E"
								d="M32.5 18C30 18 28 20 28 22.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5-2-4.5-4.5-4.5zm-17 0C13 18 11 20 11 22.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5-2-4.5-4.5-4.5z"
							/>
							<ellipse fill="#F57153" cx="8.5" cy="27.5" rx="3.5" ry="3" />
							<ellipse fill="#F57153" cx="39.5" cy="27.5" rx="3.5" ry="3" />
							<circle fill="#FFF" cx="14.5" cy="21.5" r="1" />
							<circle fill="#FFF" cx="16.5" cy="23.5" r=".5" />
							<circle fill="#FFF" cx="33.5" cy="23.5" r=".5" />
							<circle fill="#FFF" cx="31.5" cy="21.5" r="1" />
						</g>

						<g className="dealwithit">
							<path fill="#FFF" d="M8 19h30v4H20v2h-8" />
							<path
								fill="#08252E"
								d="M14 21v2h2v-2h-2zM0 21h4v-2H0v2zm4-4v2h2v2h2v2h2v2h2v2h10v-2h2v-2h4v2h10v-2h2v-2h2v-4H4zm16 8h-2v-2h-2v2h-2v-2h-2v-2h-2v-2h2v2h2v-2h2v2h2v2h2v2zm16-2h-2v-2h-2v2h-2v-2h-2v-2h2v2h2v-2h2v2h2v2z"
							/>
						</g>

						<g className="somber">
							<path
								fill="none"
								stroke="#08252E"
								strokeWidth="2"
								strokeLinecap="round"
								strokeMiterlimit="10"
								d="M20 19v3c0 1.7-1.3 3-3 3s-3-1.3-3-3v-3M28 19v3c0 1.7 1.3 3 3 3s3-1.3 3-3v-3"
							/>
						</g>

						<g className="blush">
							<path
								fill="#FFF"
								d="M32 14c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm-16 0c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7z"
							/>
							<ellipse fill="#F57153" cx="11.5" cy="25.5" rx="3.5" ry="3" />
							<ellipse fill="#F57153" cx="36.5" cy="25.5" rx="3.5" ry="3" />
							<g
								fill="none"
								stroke="#08252E"
								strokeWidth="2"
								strokeLinejoin="bevel"
								strokeMiterlimit="10"
							>
								<path d="M36.9 27.2l2.1 2.1M40.2 27.2l2.1 2.1" />
							</g>
							<g
								fill="none"
								stroke="#08252E"
								strokeWidth="2"
								strokeLinejoin="bevel"
								strokeMiterlimit="10"
							>
								<path d="M5.9 27.2L8 29.3M9.2 27.2l2.1 2.1" />
							</g>
							<path fill="#08252E" d="M28 20h5v5h-5z" />
							<path fill="#08252E" d="M15 20h5v5h-5z" />
						</g>

						<g className="sad">
							<path
								fill="#FFFFFF"
								d="M29.8,14.4C27,15.3,25,17.9,25,21c0,3.9,3.1,7,7,7s7-3.1,7-7c0-1-0.2-1.9-0.5-2.7L29.8,14.4z"
							/>
							<path
								fill="#FFFFFF"
								d="M17.6,14.2l-7.8,3.5C9.3,18.7,9,19.8,9,21c0,3.9,3.1,7,7,7s7-3.1,7-7C23,17.7,20.7,14.9,17.6,14.2z"
							/>
							<rect x="28" y="20" fill="#08252E" width="5" height="5" />
							<rect x="15" y="20" fill="#08252E" width="5" height="5" />
						</g>

						<g className="wink">
							<path fill="#08252E" d="M28 20h5v5h-5z" />
							<path fill="#08252E" d="M15 20h5v5h-5z" />
							<path
								fill="#FFF"
								d="M32 14c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm-16 0c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7z"
							/>
							<path fill="#08252E" d="M15 20h5v5h-5z" />
							<path
								fill="none"
								stroke="#08252E"
								strokeWidth="2"
								strokeMiterlimit="10"
								d="M33 20.6L30 23h5"
							/>
						</g>
					</g>
				</svg>
			</div>
		</div>
	);
};

export default AgentW;
