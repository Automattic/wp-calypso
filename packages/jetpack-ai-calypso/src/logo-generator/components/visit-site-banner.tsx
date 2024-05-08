/**
 * External dependencies
 */
import { Button, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { external } from '@wordpress/icons';
import clsx from 'clsx';
/**
 * Internal dependencies
 */
import jetpackLogo from '../assets/images/jetpack-logo.svg';
import './visit-site-banner.scss';
/**
 * Types
 */
import type React from 'react';

export const VisitSiteBanner: React.FC< {
	className?: string;
	siteURL?: string;
	onVisitBlankTarget: () => void;
} > = ( { className = null, siteURL = '#', onVisitBlankTarget } ) => {
	return (
		<div className={ clsx( 'jetpack-ai-logo-generator-modal-visit-site-banner', className ) }>
			<div className="jetpack-ai-logo-generator-modal-visit-site-banner__jetpack-logo">
				<img src={ jetpackLogo } alt="Jetpack" />
			</div>
			<div className="jetpack-ai-logo-generator-modal-visit-site-banner__content">
				<strong>
					{ __(
						'Do you want to know all the amazing things you can do with Jetpack AI?',
						'jetpack'
					) }
				</strong>
				<span>
					{ __(
						'Generate and tweak content, create forms, get feedback and much more.',
						'jetpack'
					) }
				</span>
				<div>
					<Button variant="link" href={ siteURL } target="_blank" onClick={ onVisitBlankTarget }>
						{ __( 'Visit website', 'jetpack' ) }
						<Icon icon={ external } size={ 20 } />
					</Button>
				</div>
			</div>
		</div>
	);
};
