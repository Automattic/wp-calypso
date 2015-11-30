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
import Notice from 'components/notice';
import PurchasesHeader from './header';
import PurchasesSite from './site';

const PurchasesList = React.createClass( {
	renderNotice() {
		const { noticeType } = this.props;

		if ( ! noticeType ) {
			return null;
		}

		let message, status;

		if ( 'cancel-success' === noticeType ) {
			message = this.translate(
				'Your purchase was canceled and refunded. The refund may take up to ' +
				'7 days to appear in your PayPal/bank/credit card account.'
			);

			status = 'is-success';
		}

		if ( 'cancel-problem' === noticeType ) {
			message = this.translate(
				'There was a problem canceling your purchase. ' +
				'Please {{a}}contact support{{/a}} for more information.',
				{
					components: {
						a: <a href="https://support.wordpress.com/" />
					}
				}
			);

			status = 'is-error';
		}

		return (
			<Notice showDismiss={ false } status={ status }>
				{ message }
			</Notice>
		);
	},

	isDataLoading() {
		if ( this.props.purchases.isFetching && ! this.props.purchases.hasLoadedFromServer ) {
			return true;
		}

		if ( ! this.props.sites.initialized ) {
			return true;
		}

		return false;
	},

	render() {
		let content;

		if ( this.isDataLoading() ) {
			content = <PurchasesSite isPlaceholder />;
		}

		if ( this.props.purchases.hasLoadedFromServer && this.props.purchases.data.length ) {
			content = getPurchasesBySite( this.props.purchases.data, this.props.sites.get() ).map(
				site => (
					<PurchasesSite
						key={ site.id }
						name={ site.title }
						slug={ site.slug }
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
			<span>
				{ this.renderNotice() }
				<Main className="purchases-list">
					<MeSidebarNavigation />
					<PurchasesHeader section={ 'purchases' } />
					{ content }
				</Main>
			</span>
		);
	}
} );

export default PurchasesList;
