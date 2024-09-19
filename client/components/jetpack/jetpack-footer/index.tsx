import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import AutomatticBylineLogo from 'calypso/components/jetpack/automattic-byline-logo';
import JetpackLogo from 'calypso/components/jetpack-logo';
import type { JetpackFooterProps } from './types';

import './style.scss';

/**
 * JetpackFooter component displays a tiny Jetpack logo with the product name on the left and the Automattic Airline "by line" on the right.
 * @param {JetpackFooterProps} props - Component properties.
 * @returns {React.ReactNode} JetpackFooter component.
 */
const JetpackFooter: React.FC< JetpackFooterProps > = ( {
	a8cLogoHref = 'https://automattic.com',
	moduleName,
	className,
	moduleNameHref = 'https://jetpack.com',
	...otherProps
} ) => {
	const translate = useTranslate();
	moduleName = moduleName ?? translate( 'Jetpack' );
	return (
		<div className={ clsx( 'jp-dashboard-footer', className ) } { ...otherProps }>
			<div className="jp-dashboard-footer__footer-left">
				<JetpackLogo
					monochrome
					size={ 16 }
					className="jp-dashboard-footer__jetpack-symbol"
					aria-label={ translate( 'Jetpack logo' ) }
				/>
				<span className="jp-dashboard-footer__module-name">
					{ moduleNameHref ? (
						<a href={ moduleNameHref } aria-label={ moduleName }>
							{ moduleName }
						</a>
					) : (
						moduleName
					) }
				</span>
			</div>
			<div className="jp-dashboard-footer__footer-right">
				<a href={ a8cLogoHref } aria-label={ translate( 'An Automattic Airline' ) }>
					<AutomatticBylineLogo height={ 7 } />
				</a>
			</div>
		</div>
	);
};

export default JetpackFooter;
