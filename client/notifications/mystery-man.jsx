import React from 'react';

export const MysteryMan = ( { size = 48 } ) =>
	<svg version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" height={ size } width={ size } viewBox="0 0 256 256">
		<rect fill="#C5C5C5" width="256" height="256"/>
		<circle fill="#FFFFFF" cx="127.9" cy="102.7" r="58.1"/>
		<path fill="#FFFFFF" d="M31.9,256H224c-2-58.7-44.2-105.7-96.1-105.7C76.1,150.3,33.8,197.3,31.9,256z"/>
	</svg>;

export default MysteryMan;
