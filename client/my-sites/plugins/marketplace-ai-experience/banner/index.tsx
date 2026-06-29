// Entry-point CTA to the Plugin Compass Describe surface. Renders one
// of two shapes:
//   - `hero`: full-width strip for the plugin browse landing.
//   - `slim`: thin bar for search-result views where vertical space is
//     at a premium.
// Both navigate to the Describe route (see `../constants.ts`); neither
// contains its own input so they don't compete with the existing plugin
// search bar.

import page from '@automattic/calypso-router';
import { Card } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useCallback } from '@wordpress/element';
import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { DESCRIBE_ROUTE_PREFIX } from '../constants';
import { sparkleFilled } from '../sparkle-icon';
import type { JSX } from 'react';

import './style.scss';

interface MarketplaceAIBannerProps {
	variant?: 'hero' | 'slim';
}

export default function MarketplaceAIBanner( {
	variant = 'hero',
}: MarketplaceAIBannerProps ): JSX.Element {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );

	const handoff = useCallback( () => {
		page( siteSlug ? `${ DESCRIBE_ROUTE_PREFIX }/${ siteSlug }` : DESCRIBE_ROUTE_PREFIX );
	}, [ siteSlug ] );

	if ( variant === 'slim' ) {
		return (
			<button type="button" className="marketplace-ai-banner is-slim" onClick={ handoff }>
				<Icon className="marketplace-ai-banner__icon" icon={ sparkleFilled } size={ 18 } />
				<span className="marketplace-ai-banner__slim-text">
					{ translate( 'Not sure which plugin you need? Describe it instead.' ) }
				</span>
				<span className="marketplace-ai-banner__slim-arrow" aria-hidden="true">
					→
				</span>
			</button>
		);
	}

	return (
		<Card className="marketplace-ai-banner is-hero">
			<div className="marketplace-ai-banner__icon" aria-hidden="true">
				<Icon icon={ sparkleFilled } size={ 28 } />
			</div>
			<div className="marketplace-ai-banner__body">
				<h3 className="marketplace-ai-banner__title">{ translate( 'Not sure which plugin?' ) }</h3>
				<p className="marketplace-ai-banner__line">
					{ translate( "Describe what you need and we'll search the catalog for you." ) }
				</p>
			</div>
			<Button variant="primary" onClick={ handoff }>
				{ translate( 'Describe →' ) }
			</Button>
		</Card>
	);
}
