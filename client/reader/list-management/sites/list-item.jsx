/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import ListItem from 'reader/list-item';
import Icon from 'reader/list-item/icon';
import Title from 'reader/list-item/title';
import Description from 'reader/list-item/description';
import Actions from 'reader/list-item/actions';
import FeedDisplayHelper from 'reader/lib/feed-display-helper';
import { decodeEntities } from 'lib/formatting';
import SiteStore from 'lib/reader-site-store';
import FeedStore from 'lib/feed-store';
import smartSetState from 'lib/react-smart-set-state';

const ListManagementSitesListItem = React.createClass( {

	propTypes: {
		listItem: React.PropTypes.object.isRequired
	},

	mixins: [ PureRenderMixin ],

	getInitialState() {
		return this.getStateFromStores();
	},

	getStateFromStores( props = this.props ) {
		const site = SiteStore.get( props.listItem.get( 'site_ID' ) ),
			feed = FeedStore.get( props.listItem.get( 'feed_ID' ) );

		return {
			site,
			feed
		};
	},

	smartSetState: smartSetState,

	componentDidMount() {
		SiteStore.on( 'change', this.handleChange );
		FeedStore.on( 'change', this.handleChange );
	},

	componentWillUnmount() {
		SiteStore.off( 'change', this.handleChange );
		FeedStore.off( 'change', this.handleChange );
	},

	componentWillReceiveProps( nextProps ) {
		this.smartSetState( this.getStateFromStores( nextProps ) );
	},

	handleChange() {
		this.smartSetState( this.getStateFromStores() );
	},

	render() {
		const siteData = this.state.site,
			feedData = this.state.feed,
			iconUrl = siteData && siteData.get( 'icon' ),
			url = siteData ? siteData.get( 'URL' ) : feedData && feedData.get( 'feed_URL' ),
			displayUrl = FeedDisplayHelper.formatUrlForDisplay( url ),
			feedTitle = FeedDisplayHelper.getFeedTitle( siteData, feedData, displayUrl );

		if ( ! feedTitle ) {
			return null;
		}

		return (
			<ListItem>
				<Icon>{ iconUrl ? <img src={ iconUrl.get( 'img' ) } alt="Feed icon" /> : null }</Icon>
				<Title>
					<a href={ FeedDisplayHelper.getFeedStreamUrl( siteData, feedData, displayUrl ) }>{ decodeEntities( feedTitle ) }</a>
				</Title>
				<Description><a href={ url }>{ displayUrl }</a></Description>
				<Actions>
				</Actions>
			</ListItem>
		);
	}

} );

export default ListManagementSitesListItem;
