/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ExpandableSidebarMenu from 'layout/sidebar/expandable';
import ReaderSidebarFollowingItem from './item';
import { toggleReaderSidebarFollowing } from 'state/ui/reader/sidebar/actions';
import { isFollowingOpen } from 'state/ui/reader/sidebar/selectors';
import getReaderFollowing from 'state/reader/follows/selectors/get-reader-following';
import ReaderSidebarHelper from 'reader/sidebar/helper';
import SidebarItem from 'layout/sidebar/item';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';
import Count from 'components/count';

/**
 * Styles
 */
import '../style.scss';

export class ReaderSidebarFollowing extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,
		sites: PropTypes.array,
		isFollowingOpen: PropTypes.bool,
	};

	handleReaderSidebarFollowedSitesClicked() {
		recordAction( 'clicked_reader_sidebar_followed_sites' );
		recordGaEvent( 'Clicked Reader Sidebar Followed Sites' );
		recordTrack( 'calypso_reader_sidebar_followed_sites_clicked' );
	}

	renderAll() {
		const { path, translate, sites } = this.props;
		// have a selector
		const sum = sites.reduce( ( acc, item ) => {
			acc = acc + item.unseen_count;
			return acc;
		}, 0 );
		return (
			<SidebarItem
				className={ ReaderSidebarHelper.itemLinkClass( '/read', path, {
					'sidebar-streams__following': true,
				} ) }
				label={ translate( 'All' ) }
				onNavigate={ this.handleReaderSidebarFollowedSitesClicked }
				link="/read"
			>
				{ sum > 0 && <Count count={ sum } compact /> }
			</SidebarItem>
		);
	}

	renderSites() {
		const { sites, path } = this.props;
		return map(
			sites,
			( site ) => site && <ReaderSidebarFollowingItem key={ site.ID } path={ path } site={ site } />
		);
	}

	render() {
		const { sites, translate } = this.props;

		if ( ! sites ) {
			return null;
		}
		return (
			<ExpandableSidebarMenu
				expanded={ this.props.isFollowingOpen }
				title={ translate( 'Following' ) }
				onClick={ this.props.toggleReaderSidebarFollowing }
				materialIcon="check_circle"
			>
				{ this.renderAll() }
				{ this.renderSites() }
			</ExpandableSidebarMenu>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			isFollowingOpen: isFollowingOpen( state, ownProps.path ),
			sites: getReaderFollowing( state ),
		};
	},
	{
		toggleReaderSidebarFollowing,
	}
)( localize( ReaderSidebarFollowing ) );
