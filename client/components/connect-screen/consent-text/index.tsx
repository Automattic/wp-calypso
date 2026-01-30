import clsx from 'clsx';
import type { ReactNode } from 'react';

import './style.scss';

export interface ConsentTextProps {
	children: ReactNode;
	className?: string;
}

/**
 * Styled consent text paragraph
 * @example
 * <ConsentText>
 *   { translate( 'By continuing, you agree to our {{a}}Terms of Service{{/a}}.', {
 *     components: {
 *       a: <a href="https://wordpress.com/tos/" target="_blank" rel="noreferrer" />
 *     }
 *   } ) }
 * </ConsentText>
 */
export function ConsentText( { children, className }: ConsentTextProps ): JSX.Element {
	return <p className={ clsx( 'connect-screen-consent-text', className ) }>{ children }</p>;
}
