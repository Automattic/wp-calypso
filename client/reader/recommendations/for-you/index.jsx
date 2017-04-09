import React from 'react';
import times from 'lodash/times';
import url from 'url';

import Main from 'components/main';
import MobileBackToSidebar from 'components/mobile-back-to-sidebar';
import InfiniteList from 'components/infinite-list';
import ListItem from 'reader/list-item';
import Icon from 'reader/list-item/icon';
import Title from 'reader/list-item/title';
import Description from 'reader/list-item/description';
import Actions from 'reader/list-item/actions';

import SiteIcon from 'blocks/site-icon';
import FollowButton from 'reader/follow-button';
import RecommendedSites from 'lib/recommended-sites-store/store';
import { fetchMore } from 'lib/recommended-sites-store/actions';
import SiteStore from 'lib/reader-site-store';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';
import { getSiteUrl } from 'reader/route';
import { decodeEntities } from 'lib/formatting';

const RecommendedForYou = React.createClass( {

	getInitialState() {
		const recommendations = this.getRecommendations();
		let fetching = false;
		if ( recommendations.length === 0 ) {
			fetchMore();
			fetching = true;
		}
		return {
			recommendations,
			fetching,
			page: 1
		};
	},

	getRecommendations() {
		const recs = RecommendedSites.get();
		return recs.map( function( rec ) {
			rec.site = SiteStore.get( rec.blog_id );
			return rec;
		} );
	},

	update() {
		this.setState( { recommendations: this.getRecommendations() } );
	},

	componentDidMount() {
		SiteStore.on( 'change', this.update );
		RecommendedSites.on( 'change', this.update );
		RecommendedSites.on( 'change', this.stopFetching );
	},

	componentWillUnmount() {
		SiteStore.off( 'change', this.update );
		RecommendedSites.off( 'change', this.update );
		RecommendedSites.off( 'change', this.stopFetching );
	},

	loadMore( options ) {
		fetchMore();
		this.setState( { fetching: true } );
		if ( options.triggeredByScroll ) {
			this.props.trackScrollPage( RecommendedSites.getPage() );
		}
	},

	stopFetching() {
		this.setState( {
			fetching: false,
			page: this.state.page + 1
		} );
	},

	renderPlaceholders() {
		const placeholders = [],
			number = this.state.recommendations.length ? 2 : 10;

		times( number, ( i ) => {
			placeholders.push(
				<ListItem className="is-placeholder" key={ 'recommendation-placeholder-' + i }>
					<Icon><SiteIcon size={ 48 } /></Icon>
					<Title>Loading</Title>
					<Description>Loading the results...</Description>
				</ListItem>
			);
		} );

		return placeholders;
	},

	getItemRef( rec ) {
		return 'recommendation-' + rec.blog_id;
	},

	trackSiteClick( event ) {
		const clickedUrl = event.currentTarget.getAttribute( 'href' );
		recordAction( 'click_site_on_recommended_for_you' );
		recordGaEvent( 'Clicked Site on Recommended For You' );
		recordTrack( 'calypso_reader_recommended_site_clicked', {
			clicked_url: clickedUrl,
			recommendation_source: 'recommendations-page',
		} );
	},

	renderItem( rec ) {
		const site = rec.site && rec.site.toJS(),
			itemKey = this.getItemRef( rec ),
			title = site.name || ( site.URL && url.parse( site.URL ).hostname ),
			siteUrl = getSiteUrl( site.ID );

		return (
			<ListItem key={ itemKey } ref={ itemKey }>
				<Icon><SiteIcon site={ site } size={ 48 } /></Icon>
				<Title>
					<a href={ siteUrl } onClick={ this.trackSiteClick }>{ title }</a>
				</Title>
				<Description>{ decodeEntities( rec.reason ) }</Description>
				<Actions>
					<FollowButton siteUrl={ site.URL } />
				</Actions>
			</ListItem>
			);
	},

	render() {
		return (
			<Main className="recommended-for-you">
				<MobileBackToSidebar>
					<h1>{ this.translate( 'Recommendations' ) }</h1>
				</MobileBackToSidebar>

				<h2 className="reader-recommended__heading">{ this.translate( 'We think you\'ll like' ) }</h2>
				<InfiniteList
					items={ this.state.recommendations }
					fetchingNextPage={ this.state.fetching }
					lastPage={ RecommendedSites.isLastPage() }
					guessedItemHeight={ 300 }
					fetchNextPage={ this.loadMore }
					getItemRef={ this.getItemRef }
					renderItem={ this.renderItem }
					renderLoadingPlaceholders={ this.renderPlaceholders }
					/>
				</Main>
			);
	}
} );

export default RecommendedForYou;
