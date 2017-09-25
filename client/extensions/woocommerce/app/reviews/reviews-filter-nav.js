/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import Search from 'components/search';
import SectionNav from 'components/section-nav';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { updateCurrentReviewsQuery } from 'woocommerce/state/ui/reviews/actions';
import { getReviewsCurrentSearch } from 'woocommerce/state/ui/reviews/selectors';

class ReviewsFilterNav extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			ID: PropTypes.number,
		} ),
		status: PropTypes.string,
		search: PropTypes.string,
	};

	doSearch = ( search ) => {
		this.props.updateCurrentReviewsQuery( this.props.site.ID, { search, status: 'any' } );
	}

	clearSearch = () => {
		const { status } = this.props;
		this.props.updateCurrentReviewsQuery( this.props.site.ID, { search: '', status } );
	}

	render() {
		const { translate, site, status } = this.props;

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

		return (
			<SectionNav selectedText={ currentSelection }>
				<NavTabs label={ translate( 'Status' ) } selectedText={ currentSelection }>
					<NavItem
						path={ getLink( '/store/reviews/:site', site ) }
						selected={ 'pending' === status }>
						{ pendingLabel }
					</NavItem>
					<NavItem
						path={ getLink( '/store/reviews/approved/:site', site ) }
						selected={ 'approved' === status }>
						{ approvedLabel }
					</NavItem>
					<NavItem
						path={ getLink( '/store/reviews/spam/:site', site ) }
						selected={ 'spam' === status }>
						{ spamLabel }
					</NavItem>
					<NavItem
						path={ getLink( '/store/reviews/trash/:site', site ) }
						selected={ 'trash' === status }>
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
		);
	}
}

export default connect(
	state => ( {
		site: getSelectedSiteWithFallback( state ),
		search: getReviewsCurrentSearch( state ),
	} ),
	dispatch => bindActionCreators( { updateCurrentReviewsQuery }, dispatch )
)( localize( ReviewsFilterNav ) );
