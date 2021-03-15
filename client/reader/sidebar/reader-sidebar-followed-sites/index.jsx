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
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import ReaderSidebarFollowingItem from './item';
import { toggleReaderSidebarFollowing } from 'calypso/state/reader-ui/sidebar/actions';
import { isFollowingOpen } from 'calypso/state/reader-ui/sidebar/selectors';
import getReaderFollowedSites from 'calypso/state/reader/follows/selectors/get-reader-followed-sites';
import ReaderSidebarHelper from 'calypso/reader/sidebar/helper';
import SidebarItem from 'calypso/layout/sidebar/item';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import Count from 'calypso/components/count';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { getFollowedSitePath } from './helper';

/**
 * Style dependencies
 */
import '../style.scss';

export class ReaderSidebarFollowedSites extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,
		sites: PropTypes.array,
		isFollowingOpen: PropTypes.bool,
	};

	handleReaderSidebarFollowedSitesClicked = () => {
		recordAction( 'clicked_reader_sidebar_followed_sites' );
		recordGaEvent( 'Clicked Reader Sidebar Followed Sites' );
		this.props.recordReaderTracksEvent( 'calypso_reader_sidebar_followed_sites_clicked' );
	};

	renderAll() {
		const { path, translate, sites } = this.props;
		const sum = sites.reduce( ( acc, { unseen_count } ) => acc + ( unseen_count | 0 ), 0 );
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

	isSelected() {
		const isItemSelected = ReaderSidebarHelper.isItemSelected;

		if ( isItemSelected( '/read', this.props.path ) ) {
			return true;
		}

		for ( const site of this.props.sites ) {
			if ( isItemSelected( getFollowedSitePath( site ), this.props.path ) ) {
				return true;
			}
		}

		return false;
	}

	render() {
		const { sites, translate } = this.props;

		if ( ! sites ) {
			return null;
		}

		const isSelected = this.isSelected();

		return (
			<ExpandableSidebarMenu
				expanded={ this.props.isFollowingOpen }
				title={ translate( 'Followed Sites' ) }
				onClick={ this.props.toggleReaderSidebarFollowing }
				materialIcon="check_circle"
				disableFlyout={ true }
				disableHighlight={ ! isSelected }
				hideExpandableIcon={ isSelected && this.props.isFollowingOpen }
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
			sites: getReaderFollowedSites( state ),
		};
	},
	{
		recordReaderTracksEvent,
		toggleReaderSidebarFollowing,
	}
)( localize( ReaderSidebarFollowedSites ) );
