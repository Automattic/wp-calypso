import clsx from 'clsx';
import * as React from 'react';
import { Assign } from 'utility-types';

interface Props {
	icon: string;
	size?: number;
}

/**
 * InlineSocialLogo is a copy of client/components/social-logo that references an inline SVG sprite.
 * This componenet is needed because:
 *
 * The XML <use> element does not work with SVGs loaded from external domains.
 * In the editor, images are loaded from the CDN (s0.wp.com) in production.
 * useInline allows us to reference an svg sprite from the current page instead.
 * see https://github.com/w3c/svgwg/issues/707
 *
 * InlineSocialLogosSprite must be included on the page where this is used
 * @returns A Social Logo SVG
 */
function InlineSocialLogo( props: Assign< React.SVGProps< SVGSVGElement >, Props > ) {
	const { size = 24, icon, className, ...otherProps } = props;

	// Using a missing icon doesn't produce any errors, just a blank icon, which is the exact intended behaviour.
	// This means we don't need to perform any checks on the icon name.
	const iconName = `social-logo-${ icon }`;
	// The current CSS expects individual icon classes in the form of e.g. `.twitter`, but the social-logos build
	// appears to generate them in the form of `.social-logo-twitter` instead.
	// We add both here, to ensure compatibility.
	const iconClass = clsx( 'social-logo', iconName, icon, className );

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			className={ iconClass }
			height={ size }
			width={ size }
			{ ...otherProps }
		>
			<use xlinkHref={ `#${ icon }` } />
		</svg>
	);
}

export default React.memo( InlineSocialLogo );
