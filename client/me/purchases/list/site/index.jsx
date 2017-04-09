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
import PurchaseItem from '../item';
import SectionHeader from 'components/section-header';

const PurchasesSite = ( { isDomainOnly, isPlaceholder, name, purchases, slug, domain } ) => {
	let items, label = name;

	if ( isPlaceholder ) {
		items = times( 2, index => (
			<PurchaseItem
				isPlaceholder key={ index } />
		) );

		label = i18n.translate( 'Loading…' );
	} else {
		items = purchases.map( purchase => (
			<PurchaseItem
				key={ purchase.id }
				slug={ slug }
				purchase={ purchase } />
		) );
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
