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
import { getLink } from 'woocommerce/lib/nav-utils';
import { getReviewsCurrentSearch } from 'woocommerce/state/ui/reviews/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import Search from 'components/search';
import SectionNav from 'components/section-nav';
import { updateCurrentReviewsQuery } from 'woocommerce/state/ui/reviews/actions';

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
		let currentSelection = translate( 'Pending' );

		if ( 'approved' === status ) {
			currentSelection = translate( 'Approved' );
		} else if ( 'spam' === status ) {
			currentSelection = translate( 'Spam' );
		} else if ( 'trash' === status ) {
			currentSelection = translate( 'Trash' );
		}

		return (
			<SectionNav selectedText={ currentSelection }>
				<NavTabs label={ translate( 'Status' ) } selectedText={ currentSelection }>
					<NavItem
						path={ getLink( '/store/reviews/:site', site ) }
						selected={ 'pending' === status }>
						{ translate( 'Pending' ) }
					</NavItem>
					<NavItem
						path={ getLink( '/store/reviews/approved/:site', site ) }
						selected={ 'approved' === status }>
						{ translate( 'Approved' ) }
					</NavItem>
					<NavItem
						path={ getLink( '/store/reviews/spam/:site', site ) }
						selected={ 'spam' === status }>
						{ translate( 'Spam' ) }
					</NavItem>
					<NavItem
						path={ getLink( '/store/reviews/trash/:site', site ) }
						selected={ 'trash' === status }>
						{ translate( 'Trash' ) }
					</NavItem>
					<NavItem
						path={ getLink( '/store/reviews/any/:site', site ) }
						selected={ 'any' === status }>
						{ translate( 'All' ) }
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
