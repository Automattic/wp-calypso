/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React from 'react';
import { SVG, Rect, Circle } from '@wordpress/components';

const Confetti: React.FunctionComponent< { className?: string } > = ( { className } ) => (
	<SVG
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 356 136"
		role="presentation"
		className={ className }
	>
		<Rect
			x="314.913"
			y="59.963"
			width="7"
			height="22"
			rx="3.5"
			transform="rotate(-50 314.913 59.963)"
			fill="#984A9C"
		/>
		<Rect
			y="121.876"
			width="5.091"
			height="16"
			rx="2.545"
			transform="rotate(-50 0 121.876)"
			fill="#64CA43"
		/>
		<Rect
			x="21.447"
			y="85.104"
			width="7"
			height="22"
			rx="3.5"
			transform="rotate(-120 21.447 85.104)"
			fill="#37E788"
		/>
		<Rect
			x="75"
			y="61.64"
			width="4"
			height="12.571"
			rx="2"
			transform="rotate(130 75 61.64)"
			fill="#FF2D55"
		/>
		<Rect
			x="247.461"
			y="63.86"
			width="4.773"
			height="15"
			rx="2.386"
			transform="rotate(118 247.461 63.86)"
			fill="#E7C037"
		/>
		<Rect
			x="97"
			y="2.529"
			width="4.773"
			height="15"
			rx="2.386"
			transform="rotate(-32 97 2.53)"
			fill="#117AC9"
		/>
		<Rect
			x="323.638"
			y="110.513"
			width="5.091"
			height="16"
			rx="2.545"
			transform="rotate(40 323.638 110.513)"
			fill="#3361CC"
		/>
		<Rect
			x="160.138"
			y="27"
			width="7"
			height="22"
			rx="3.5"
			transform="rotate(40 160.138 27)"
			fill="#FF8085"
		/>
		<Circle cx="40.5" cy="101.095" r="4.5" fill="#F0B849" />
		<Circle cx="20.928" cy="47.751" r="3" fill="#BF5AF2" />
		<Circle cx="341" cy="134" r="2" fill="#F0C930" />
		<Circle cx="131" cy="83" r="2" fill="#3361CC" />
		<Circle cx="214.5" cy="13.5" r="2.5" fill="#37E688" />
		<Circle cx="352.763" cy="98.263" r="3" fill="#09A884" />
		<Circle cx="285.181" cy="60.541" r="3" fill="#FF3B30" />
	</SVG>
);

export default Confetti;
