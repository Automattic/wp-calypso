/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import {
	identity,
	includes,
} from 'lodash';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import PurchaseButton from './purchase-button';

export const JetpackPluginItem = ( {
	plugin,
	siteSlug,
	translate = identity
} ) => {
	const translatePlan = {
		premium: translate( 'Premium' ),
		business: translate( 'Business' ),
	};
	const planClasses = [
		'button',
		'is-compact',
		'is-borderless',
		`plugins-wpcom__is-${ plugin.plan }-plugin`,
	].join( ' ' );
	const featureLink = plugin.feature ? `?feature=${ plugin.feature }` : '';

	return (
		<CompactCard className="plugins-wpcom__jetpack-plugin-item">
			<a href={ plugin.link } className="plugins-wpcom__plugin-link">
				<div className="plugins-wpcom__plugin-name">
					{ plugin.name }
					{ includes( [ 'premium', 'business' ], plugin.plan ) &&
						<span className={ planClasses }>
							{ translatePlan[ plugin.plan ] }
						</span>
					}
				</div>
				<div className="plugins-wpcom__plugin-description">
					{ plugin.description }
				</div>
			</a>
			<div className="plugins-wpcom__plugin-actions">
				<PurchaseButton { ...{
					isActive: plugin.isActive,
					href: `/plans/${ siteSlug }${ featureLink }`
				} } />
			</div>
		</CompactCard>
	);
};

JetpackPluginItem.propTypes = {
	plugin: PropTypes.object,
	siteSlug: PropTypes.string,
};

export default localize( JetpackPluginItem );
