/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import PurchaseButton from './purchase-button';

export const JetpackPluginItem = ( {
	plugin,
	siteSlug,
	isActive,
	translate = identity
} ) => {
	const translatePlan = {
		premium: translate( 'Premium' ),
		business: translate( 'Business' ),
	};
	const planClasses = classNames(
		'button',
		'is-compact',
		'is-borderless',
		`plugins-wpcom__is-${ plugin.plan }-plugin`
	);
	const plan = [ 'premium', 'business' ].includes( plugin.plan )
		? <span className={ planClasses }>
				{ translatePlan[ plugin.plan ] }
			</span>
		: null;

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
				<PurchaseButton { ...{ isActive: isActive, href: `/plans/${ siteSlug }` } } />
			</div>
		</CompactCard>
	);
};

JetpackPluginItem.propTypes = {
	plugin: PropTypes.object,
	siteSlug: PropTypes.string,
	isActive: PropTypes.bool,
};

export default localize( JetpackPluginItem );
