/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { isEmpty, times } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { addQueryArgs } from 'lib/url';
import CompactCard from 'components/card/compact';
import DocumentHead from 'components/data/document-head';
import EmptyContent from 'components/empty-content';
import MobileBackToSidebar from 'components/mobile-back-to-sidebar';
import Notice from 'components/notice';
import PostPlaceholder from 'reader/stream/post-placeholder';
import PostTime from 'reader/post-time';
import ReaderMain from 'components/reader-main';
import { searchComments } from 'state/reader/comments/actions';
import SearchInput from 'components/search';

export class Comments extends Component {
	static propTypes = {
		comments: PropTypes.object.isRequired,
		query: PropTypes.string.isRequired,
		searchComments: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.searchComments( this.props.query );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.query !== nextProps.query ) {
			this.searchComments( nextProps.query );
		}
	}

	openSite( url ) {
		window.open( url, '_blank' );
	}

	searchComments( query ) {
		if ( query !== this.props.comments.query ) {
			this.props.searchComments( query );
		}
	}

	updateQuery = ( query ) => {
		let url = window.location.pathname;

		if ( !isEmpty( query ) ) {
			url = addQueryArgs( { q: query }, url );
		}

		page( url );
	};

	renderComment = ( comment ) => {
		return (
			<div className="card reader-post-card" key={ comment.url } onClick={ this.openSite.bind( this, comment.url ) }>
				<div className="reader-post-card__post">
					<div className="reader-post-card__post-details">
						<div className="reader-excerpt__content reader-excerpt">
							<p>{ comment.comment }</p>
						</div>

						<div className="reader-post-card__byline">
							<div className="reader-post-card__byline-details">
								<div className="reader-post-card__byline-author-site">
									{ comment.postTitle }, { comment.siteName }
								</div>

								<div className="reader-post-card__timestamp-and-tag">
									<div className="reader-post-card__timestamp">
										<div className="reader-post-card__timestamp-link">
											<PostTime date={ comment.date } />
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};

	renderContent() {
		const { comments: { error, isRequesting, items: comments }, query, translate } = this.props;

		if ( isRequesting ) {
			return times( 3, index => {
				return (
					<PostPlaceholder key={ 'feed-post-placeholder-' + index } />
				);
			} );
		}

		if ( error ) {
			return (
				<Notice status={ 'is-error' } showDismiss={ false }>
					{ error }
				</Notice>
			);
		}

		if ( isEmpty( query ) && isEmpty( comments ) ) {
			return (
				<EmptyContent
					title={ translate( 'No Comments Yet' ) }
					line={ translate( 'Comments that you posted will appear here.' ) }
					illustration={ '/calypso/images/illustrations/illustration-empty-results.svg' }
					illustrationWidth={ 400 } />
			);
		}

		if ( isEmpty( comments ) ) {
			return (
				<EmptyContent
					title={ translate( 'No Comments Found' ) }
					line={ translate( 'Use different search terms.' ) } />
			);
		}

		return (
			<div className="reader__content">
				{ comments.map( this.renderComment ) }
			</div>
		);
	}

	render() {
		const { query, translate } = this.props;

		return (
			<ReaderMain className="reader-comments">
				<DocumentHead title={ translate( '%s ‹ Reader', { args: translate( 'My Comments' ) } ) } />

				<MobileBackToSidebar>
					<h1>{ translate( 'Streams' ) }</h1>
				</MobileBackToSidebar>

				<CompactCard className="reader-comments__search">
					<SearchInput
						autoFocus={ true }
						delaySearch={ true }
						delayTimeout={ 500 }
						initialValue={ query }
						placeholder={ translate( 'Search your comments…' ) }
						value={ query }
						onSearch={ this.updateQuery } />
				</CompactCard>

				{ this.renderContent() }
			</ReaderMain>
		);
	}
}

export default connect(
	state => ( {
		comments: state.reader.comments
	} ),
	{
		searchComments,
	}
)( localize( Comments ) );
