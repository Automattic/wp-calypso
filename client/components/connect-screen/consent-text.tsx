import { createInterpolateElement, useMemo } from '@wordpress/element';
import clsx from 'clsx';
import type { ConsentTextProps } from './types';

import './style.scss';

/**
 * Consent text with link support using createInterpolateElement
 *
 * Use XML-like tags in text to create links. Tag names should match keys in the links prop.
 * @example
 * <ConsentText
 *   text="By continuing, you agree to our <tosLink>Terms of Service</tosLink> and <privacyLink>Privacy Policy</privacyLink>."
 *   links={{
 *     tosLink: "https://wordpress.com/tos/",
 *     privacyLink: "https://automattic.com/privacy/"
 *   }}
 * />
 */
export function ConsentText( { text, links = {}, className }: ConsentTextProps ): JSX.Element {
	const interpolatedText = useMemo( () => {
		// Build the interpolation options from links
		const linkElements: Record< string, JSX.Element > = {};

		for ( const [ key, url ] of Object.entries( links ) ) {
			linkElements[ key ] = (
				<a href={ url } target="_blank" rel="noopener noreferrer">
					{ /* Placeholder content - will be replaced by createInterpolateElement */ }
				</a>
			);
		}

		// If no links, return plain text
		if ( Object.keys( linkElements ).length === 0 ) {
			return text;
		}

		return createInterpolateElement( text, linkElements );
	}, [ text, links ] );

	return <p className={ clsx( 'connect-screen-consent-text', className ) }>{ interpolatedText }</p>;
}
