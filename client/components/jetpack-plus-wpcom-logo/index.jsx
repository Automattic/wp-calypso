/**
 * External dependencies
 */
import colorStudio from '@automattic/color-studio';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Module constants
 */
const PALETTE = colorStudio.colors;
const COLOR_JETPACK = PALETTE[ 'Jetpack Green 40' ];
const COLOR_WORDPRESS = PALETTE[ 'WordPress Blue 40' ];
const COLOR_WHITE = PALETTE[ 'White' ]; // eslint-disable-line dot-notation
const COLOR_GRAY = PALETTE[ 'Gray 80' ];

const JetpackPlusWpComLogo = ( { size = 32, className } ) => {
	const classes = classNames( 'jetpack-plus-wpcom-logo', className );

	return (
		<svg height={ size } className={ classes } viewBox="0 0 2000 629">
			<path
				d="M1821.1 558.9l89-249.7c16.7-40.4 22.2-72.6 22.2-101.3 0-10.4-.7-20-2-29a274.8 274.8 0 0135.7 135.6c0 104.3-58.2 195.4-144.9 244.4zm-106.3-377c17.5-.9 33.3-2.7 33.3-2.7 15.7-1.8 13.9-24.2-1.8-23.3 0 0-47.2 3.6-77.7 3.6-28.7 0-76.8-3.6-76.8-3.6-15.7-.9-17.5 22.4-1.8 23.3 0 0 14.8 1.8 30.5 2.7l45.4 120.7-63.7 185.6L1496 181.9c17.6-.9 33.4-2.7 33.4-2.7 15.7-1.8 13.8-24.2-1.9-23.3 0 0-47.2 3.6-77.6 3.6l-18.8-.3a293.5 293.5 0 01243.5-127.5c75.9 0 145 28.2 196.8 74.3-1.3-.1-2.5-.3-3.8-.3-28.6 0-49 24.2-49 50.2 0 23.3 14 43 28.7 66.3 11 18.9 24 43 24 78 0 24.2-7.4 54.7-22.1 91.4L1820 486zm-40.2 415.4a300 300 0 01-82.3-11.5l87.4-246.6 89.6 238.1 2 4a299.2 299.2 0 01-96.7 16zm-291.4-282.8c0-41 9-80 25.2-115l139 369.5c-97.2-45.9-164.2-142.6-164.2-254.5zM1674.6 0c-178.7 0-324.1 141-324.1 314.5 0 173.4 145.4 314.5 324.1 314.5 178.7 0 324.1-141 324.1-314.5C1998.7 141 1853.3 0 1674.6 0z"
				fill={ COLOR_WORDPRESS }
			/>
			<path
				d="M311.4 629c171.7 0 310.8-140.8 310.8-314.5S483.1 0 311.4 0C139.7 0 .6 140.8.6 314.5S139.7 629 311.4 629z"
				fill={ COLOR_JETPACK }
			/>
			<path d="M326.8 261.7v304.9l155.4-305zM295.4 366.7V62.4L140.6 366.7z" fill={ COLOR_WHITE } />
			<path
				d="M1026 341.2h84.4v-52.9H1026v-83.5h-52v83.5h-84.2v52.9h84.1v83.7h52.1z"
				fill={ COLOR_GRAY }
			/>
		</svg>
	);
};

JetpackPlusWpComLogo.propTypes = {
	className: PropTypes.string,
	size: PropTypes.number,
};

export default JetpackPlusWpComLogo;
