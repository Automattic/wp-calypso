/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Button from 'components/button';
import PurchaseButton from './purchase-button';

export const JetpackPluginItem = ( {
	plugin,
	siteSlug,
	translate = identity
} ) => {
	let plan;

	if ( plugin.plan === 'premium' ) {
		plan = <Button compact borderless className="plugins-wpcom__is-premium-plugin">
			{ translate( 'Premium' ) }
		</Button>;
	} else if ( plugin.plan === 'business' ) {
		plan = <Button compact borderless className="plugins-wpcom__is-business-plugin">
			{ translate( 'Business' ) }
		</Button>;
	} else {
		plan = null;
	}

	return (
		<CompactCard className="plugins-wpcom__jetpack-plugin-item">
			<a href={ plugin.link } className="plugins-wpcom__plugin-link">
				<div className="plugins-wpcom__plugin-name">
					{ plugin.name }
					{ plan }
				</div>
				<div className="plugins-wpcom__plugin-description">
					{ plugin.description }
				</div>
			</a>
			<div className="plugins-wpcom__plugin-actions">
				<PurchaseButton { ...{ isActive: plugin.isActive, href: `/plans/${ siteSlug }` } } />
			</div>
		</CompactCard>
	);
};

JetpackPluginItem.propTypes = {
	plugin: PropTypes.object,
	siteSlug: PropTypes.string,
};

export default localize( JetpackPluginItem );
