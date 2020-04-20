/**
 * External dependencies
 */

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { fetchProduct } from 'woocommerce/state/sites/products/actions';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getProduct } from 'woocommerce/state/sites/products/selectors';
import { getReviewsCurrentSearch } from 'woocommerce/state/ui/reviews/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import Search from 'components/search';
import SectionNav from 'components/section-nav';
import { updateCurrentReviewsQuery } from 'woocommerce/state/ui/reviews/actions';

class ReviewsFilterNav extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			ID: PropTypes.number,
		} ),
		productId: PropTypes.number,
		status: PropTypes.string,
		search: PropTypes.string,
	};

	componentDidMount() {
		const { site, productId } = this.props;

		if ( site && site.ID ) {
			if ( productId ) {
				this.props.fetchProduct( site.ID, productId );
			}
		}
	}

	UNSAFE_componentWillReceiveProps( newProps ) {
		const { site, productId } = this.props;
		const newSiteId = ( newProps.site && newProps.site.ID ) || null;
		const oldSiteId = ( site && site.ID ) || null;
		if ( oldSiteId !== newSiteId && productId ) {
			this.props.fetchProduct( newSiteId, productId );
		}
	}

	doSearch = ( search ) => {
		const { productId } = this.props;
		const updatedStateQuery = { search, status: 'any' };
		if ( productId ) {
			updatedStateQuery.product = productId;
		}
		this.props.updateCurrentReviewsQuery( this.props.site.ID, updatedStateQuery );
	};

	clearSearch = () => {
		const { status, productId } = this.props;
		const updatedStateQuery = { search: '', status };
		if ( productId ) {
			updatedStateQuery.product = productId;
		}
		this.props.updateCurrentReviewsQuery( this.props.site.ID, updatedStateQuery );
	};

	render() {
		const { translate, site, status, productId, product } = this.props;

		const pendingLabel = translate( 'Pending' );
		const approvedLabel = translate( 'Approved' );
		const spamLabel = translate( 'Spam' );
		const trashlabel = translate( 'Trash' );

		let currentSelection = pendingLabel;
		if ( 'approved' === status ) {
			currentSelection = approvedLabel;
		} else if ( 'spam' === status ) {
			currentSelection = spamLabel;
		} else if ( 'trash' === status ) {
			currentSelection = trashlabel;
		}

		const pendingLink = productId
			? getLink( `/store/reviews/${ productId }/pending/:site`, site )
			: getLink( '/store/reviews/:site', site );

		const approvedLink = productId
			? getLink( `/store/reviews/${ productId }/approved/:site`, site )
			: getLink( '/store/reviews/approved/:site', site );

		const spamLink = productId
			? getLink( `/store/reviews/${ productId }/spam/:site`, site )
			: getLink( '/store/reviews/spam/:site', site );

		const trashLink = productId
			? getLink( `/store/reviews/${ productId }/trash/:site`, site )
			: getLink( '/store/reviews/trash/:site', site );

		return (
			<div className="reviews__filter-nav">
				{ product && (
					<Notice
						text={ translate(
							'Viewing reviews for {{productLink}}%(productName)s{{/productLink}}.',
							{
								args: {
									productName: product.name,
								},
								components: {
									productLink: (
										<a href={ getLink( `/store/product/:site/${ product.id }`, site ) } />
									),
								},
							}
						) }
						showDismiss={ false }
					>
						<NoticeAction href={ getLink( `/store/reviews/${ status }/:site/`, site ) }>
							{ translate( 'View all reviews' ) }
						</NoticeAction>
					</Notice>
				) }
				<SectionNav selectedText={ currentSelection }>
					<NavTabs label={ translate( 'Status' ) } selectedText={ currentSelection }>
						<NavItem path={ pendingLink } selected={ 'pending' === status }>
							{ pendingLabel }
						</NavItem>
						<NavItem path={ approvedLink } selected={ 'approved' === status }>
							{ approvedLabel }
						</NavItem>
						<NavItem path={ spamLink } selected={ 'spam' === status }>
							{ spamLabel }
						</NavItem>
						<NavItem path={ trashLink } selected={ 'trash' === status }>
							{ trashlabel }
						</NavItem>
					</NavTabs>

					<Search
						pinned
						fitsContainer
						onSearch={ this.doSearch }
						onSearchClose={ this.clearSearch }
						placeholder={ translate( 'Search reviews' ) }
						analyticsGroup="Reviews"
						delaySearch
					/>
				</SectionNav>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		site: getSelectedSiteWithFallback( state ),
		search: getReviewsCurrentSearch( state ),
		product: ownProps.productId && getProduct( state, ownProps.productId ),
	} ),
	( dispatch ) => bindActionCreators( { updateCurrentReviewsQuery, fetchProduct }, dispatch )
)( localize( ReviewsFilterNav ) );
