/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';
import times from 'lodash/times';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PurchaseItem from '../purchase-item';
import SectionHeader from 'components/section-header';
import SiteIcon from 'blocks/site-icon';

const PurchasesSite = ( { isDomainOnly, isPlaceholder, siteId, name, purchases, slug, domain } ) => {
	let items, label;

	if ( isPlaceholder ) {
		items = times( 2, index => (
			<PurchaseItem
				isPlaceholder key={ index } />
		) );

		label = (
			<span>
				<SiteIcon siteId={ siteId } />
				{ i18n.translate( 'Loading…' ) }
			</span>
		);
	} else {
		items = purchases.map( purchase => (
			<PurchaseItem
				key={ purchase.id }
				slug={ slug }
				purchase={ purchase } />
		) );
		label = (
			<span>
				<SiteIcon siteId={ siteId } />
				{ name }
			</span>
		);
	}

	return (
		<div className={ classNames( 'purchases-site', { 'is-placeholder': isPlaceholder } ) }>
			<SectionHeader label={ label }>
				{ ! isDomainOnly && (
					<span className="purchases-site__slug">{ domain }</span>
				) }
			</SectionHeader>

			{ items }
		</div>
	);
};

PurchasesSite.propTypes = {
	domain: React.PropTypes.string,
	isDomainOnly: React.PropTypes.bool,
	isPlaceholder: React.PropTypes.bool,
	name: React.PropTypes.string,
	purchases: React.PropTypes.array,
	slug: React.PropTypes.string
};

export default PurchasesSite;
