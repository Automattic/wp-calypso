import type React from 'react';

export interface AutomatticBylineLogoProps extends React.SVGProps< SVGSVGElement > {
	/**
	 * Title for SVG.
	 */
	title?: string;

	/**
	 * Height for SVG.
	 */
	height?: number;

	/**
	 * Additional className for the a wrapper. `jp-automattic-byline-logo` always included
	 */
	className?: string;
}
