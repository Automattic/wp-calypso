/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

/**
 * Style dependencies
 */
import './style.scss';

export const NoJetpackSitesMessage = ( { siteSlug }: { siteSlug: string | undefined } ) => {
	const translate = useTranslate();

	return (
		<div className="no-jetpack-sites-message">
			<h2 className="no-jetpack-sites-message__header">
				{ translate( 'Jetpack features are already part of WordPress.com' ) }
			</h2>
			{ siteSlug && (
				<p>
					{ translate(
						'Your site, %(siteSlug)s, already has the power of Jetpack built in. Its features can be found within your WordPress.com dashboard.',
						{ args: { siteSlug } }
					) }
				</p>
			) }
			<p>
				{ translate( 'This area is only for Jetpack customers with self-hosted WordPress sites.' ) }
			</p>
			<Button primary href="https://wordpress.com" rel="noopener noreferrer">
				{ translate( 'Visit Dashboard' ) }
			</Button>
		</div>
	);
};
