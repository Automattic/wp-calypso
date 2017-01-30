/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { map, times } from 'lodash';
import page from 'page';
import Masonry from 'react-masonry-component';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import { getRecommendationIds } from 'state/reader/start/selectors';
import { getFollowCount } from 'state/selectors/get-follow-count';
import QueryReaderStartRecommendations from 'components/data/query-reader-start-recommendations';
import StartCard from './card';
import CardPlaceholder from './card-placeholder';
import { recordTrack } from 'reader/stats';
import StartSearch from './search';
import { localize } from 'i18n-calypso';

const tracksSource = 'recommended_cold_start';

const Start = React.createClass( {

	componentWillUnmount() {
		this.masonry = null;
	},

	bindMasonry( component ) {
		this.masonry = component && component.masonry;
	},

	componentDidUpdate() {
		this.masonry && this.masonry.layout();
	},

	exitColdStart() {
		// Redirect to the following stream
		page.redirect( '/' );
	},

	renderLoadingPlaceholders() {
		const count = 4;
		return times( count, function( i ) {
			return ( <CardPlaceholder key={ 'placeholder-' + i } /> );
		} );
	},

	handleFollowByUrlClick() {
		recordTrack( 'calypso_reader_start_follow_by_url_link', { source: tracksSource } );
	},

	render() {
		const followCount = this.props.followCount;
		const canExit = ( followCount > 0 );
		const hasRecommendations = this.props.recommendationIds.length > 0;
		const hasSearchQuery = !! this.props.query;

		return (
			<Main className="reader-start">
				{ /* Have not followed a site yet */ }
				{ ! canExit && hasRecommendations &&
					<div className="reader-start__bar is-follow">
						<span className="reader-start__bar-text">{ this.translate( 'Follow some sites to begin.' ) }</span>
					</div>
				}

				{ /* Following at least one or more sites */ }
				{ canExit && hasRecommendations &&
					<div className="reader-start__bar is-following">
						<span className="reader-start__bar-text">
							{
								this.translate(
									'You\'re following %(followCount)d new site.',
									'You\'re following %(followCount)d new sites.',
									{
										count: followCount,
										args: {
											followCount: followCount
										}
									}
								)
							}
						</span>
						<a onClick={ this.exitColdStart } className="reader-start__bar-action">{ this.translate( 'Done.' ) }</a>
					</div>
				}

				<QueryReaderStartRecommendations />
				<header className="reader-start__intro">
					<h1 className="reader-start__title">{ this.translate( 'This is Reader' ) }</h1>
					<p className="reader-start__description">{ this.translate( 'Reader is a customizable magazine of stories from WordPress.com and across the web. Follow a few sites and their latest posts will appear here. To begin, tell us something you like.' ) }</p>
				</header>

				<StartSearch { ...this.props } />

				{ ! hasSearchQuery && (
					<h2 className="reader-start__subtitle">
						{ this.props.translate( 'Or browse suggestions:' ) }
					</h2> )
				}

				<div className="reader-start__cards">{ ! hasRecommendations && this.renderLoadingPlaceholders() }</div>

				{ hasRecommendations && ! hasSearchQuery && <Masonry className="reader-start__cards" updateOnEachImageLoad={ true } ref={ this.bindMasonry } options={ { gutter: 14 } }>
					{ this.props.recommendationIds ? map( this.props.recommendationIds, ( recId ) => {
						return (
							<StartCard
								key={ 'start-card-rec' + recId }
								recommendationId={ recId } />
						);
					} ) : null }
				</Masonry> }

				{ hasRecommendations && ! hasSearchQuery &&
				<div className="reader-start__manage">{ this.translate( 'Didn\'t find a site you\'re looking for?' ) }
					&nbsp;<a href="/following/edit" onClick={ this.handleFollowByUrlClick }>Follow by URL</a>.
				</div> }
			</Main>
		);
	}
} );

export default connect(
	( state ) => {
		return {
			recommendationIds: getRecommendationIds( state ),
			followCount: getFollowCount( state )
		};
	}
)( localize( Start ) );
