/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useI18n } from '@automattic/react-i18n';

export const DomainNameExplanationImage: FunctionComponent = () => {
	const { __, isRTL } = useI18n();

	return (
		<svg
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
			xmlnsXlink="http://www.w3.org/1999/xlink"
			x="0px"
			y="0px"
			viewBox="0 0 300 40"
			xmlSpace="preserve"
			width="300"
			style={ isRTL() ? { transform: 'scaleX(-1)' } : undefined }
		>
			<rect x="0" width="310" height="50" rx="10" fill="#D8D8D8" />
			<rect x="8" y="8" width="25" height="25" rx="5" fill="#fff" />
			<rect x="40" y="8" width="25" height="25" rx="5" fill="#fff" />
			<rect x="72" y="8" width="300" height="25" rx="5" fill="#fff" />
			<text
				x="80"
				y="26"
				direction="ltr"
				textAnchor={ isRTL() ? 'end' : 'start' }
				transform={ isRTL() ? 'scale(-1,1) translate(-160,0)' : undefined }
			>
				<tspan fill="#999">
					<tspan>https://</tspan>
				</tspan>
				<tspan fill="#515151" dx="4.5">
					{
						/* translators: An example domain name. Used to describe what a domain name is. */
						__( 'example.com', __i18n_text_domain__ )
					}
				</tspan>
			</text>
		</svg>
	);
};
