/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import CompactCard from 'components/card';
import EmptyContent from 'components/empty-content';
import { getPurchasesBySite } from 'lib/purchases';
import Main from 'components/main';
import MeSidebarNavigation from 'me/sidebar-navigation';
import PurchasesHeader from './header';
import PurchasesSite from './site';

const PurchasesList = React.createClass( {
	render() {
		let content;

		if ( ! this.props.purchases.isFetching && ! this.props.purchases.hasLoadedFromServer ) {
			return null;
		}

		if ( this.props.purchases.isFetching && ! this.props.purchases.hasLoadedFromServer ) {
			content = <PurchasesSite isPlaceholder />;
		}

		if ( this.props.purchases.hasLoadedFromServer && this.props.purchases.data.length ) {
			content = getPurchasesBySite( this.props.purchases.data ).map(
				site => (
					<PurchasesSite
						key={ site.id }
						name={ site.title }
						domain={ site.domain }
						purchases={ site.purchases } />
				)
			);
		}

		if ( this.props.purchases.hasLoadedFromServer && ! this.props.purchases.data.length ) {
			content = (
				<CompactCard className="purchases-list__no-content">
					<EmptyContent
						title={ this.translate( 'Looking to upgrade?' ) }
						line={ this.translate( 'Our plans give your site the power to thrive. ' +
								'Find the plan that works for you.' ) }
						action={ this.translate( 'Upgrade Now' ) }
						actionURL={ '/plans' }
						illustration={ '/calypso/images/drake/drake-whoops.svg' }
						isCompact />
				</CompactCard>
			);
		}

		return (
			<Main className="purchases-list">
				<MeSidebarNavigation />
				<PurchasesHeader section={ 'purchases' } />
				{ content }
			</Main>
		);
	}
} );

export default PurchasesList;
