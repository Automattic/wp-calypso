import { __ } from '@wordpress/i18n';
import classnames from 'classnames';
import React from 'react';
import JetpackLogo from 'calypso/components/jetpack-logo';
import AutomatticBylineLogo from 'calypso/components/jetpack/automattic-byline-logo';
import type { JetpackFooterProps } from './types';

import './style.scss';

/**
 * JetpackFooter component displays a tiny Jetpack logo with the product name on the left and the Automattic Airline "by line" on the right.
 *
 * @param {JetpackFooterProps} props - Component properties.
 * @returns {React.ReactNode} JetpackFooter component.
 */
const JetpackFooter: React.FC< JetpackFooterProps > = ( {
	a8cLogoHref = 'https://automattic.com',
	moduleName = __( 'Jetpack', 'jetpack' ),
	className,
	moduleNameHref = 'https://jetpack.com',
	...otherProps
} ) => {
	return (
		<div className={ classnames( 'jp-dashboard-footer', className ) } { ...otherProps }>
			<div className="jp-dashboard-footer__footer-left">
				<JetpackLogo
					monochrome
					size={ 16 }
					className="jp-dashboard-footer__jetpack-symbol"
					aria-label={ __( 'Jetpack logo', 'jetpack' ) }
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
				<a href={ a8cLogoHref } aria-label={ __( 'An Automattic Airline', 'jetpack' ) }>
					<AutomatticBylineLogo height={ 7 } />
				</a>
			</div>
		</div>
	);
};

export default JetpackFooter;
