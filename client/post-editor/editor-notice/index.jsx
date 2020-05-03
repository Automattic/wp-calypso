/**
 * External dependencies
 */
import { isMobile } from '@automattic/viewport';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import GlobalNoticesContainer from 'components/global-notices/container';
import Notice from 'components/notice';
import { getSelectedSiteId, getSelectedSite } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPost } from 'state/posts/selectors';
import { getPostType } from 'state/post-types/selectors';
import QueryPostTypes from 'components/data/query-post-types';
import { withLocalizedMoment } from 'components/localized-moment';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { recordTracksEvent } from 'state/analytics/actions';

export class EditorNotice extends Component {
	static propTypes = {
		translate: PropTypes.func,
		moment: PropTypes.func,
		siteId: PropTypes.number,
		site: PropTypes.object,
		type: PropTypes.string,
		typeObject: PropTypes.object,
		message: PropTypes.string,
		status: PropTypes.string,
		onDismissClick: PropTypes.func,
		error: PropTypes.object,
		postUrl: PropTypes.string,
		postDate: PropTypes.string,
	};

	handleViewPostClick = () => {
		this.props.recordTracksEvent( 'calypso_editor_notice_view_post_click' );
	};

	handleAddPagePromptClick = () => {
		this.props.recordTracksEvent( 'calypso_editor_notice_add_page_prompt_click' );
	};

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if (
			isMobile() &&
			( ( ! this.props.message && nextProps.message ) || ( ! this.props.error && nextProps.error ) )
		) {
			// If we are showing a notice that didn't exist before, switch to the main editor view to show it
			this.props.setLayoutFocus( 'content' );
		}
	}

	getErrorMessage() {
		const { translate, error } = this.props;
		if ( ! error ) {
			return;
		}

		switch ( error.message ) {
			case 'NO_CONTENT':
				return translate( "You haven't written anything yet!" );
		}
	}

	getText( key ) {
		const { translate, type, typeObject, site, postUrl, postDate, moment } = this.props;
		const formattedPostDate = moment( postDate ).format( 'lll' );
		const typeLabel = get( typeObject, 'labels.singular_name', type );

		switch ( key ) {
			case 'publishFailure':
				if ( 'post' === type ) {
					return translate( 'Publishing of post failed.' );
				}

				if ( 'page' === type ) {
					return translate( 'Publishing of page failed.' );
				}

				return translate( 'Publishing of %(typeLabel)s failed.', {
					args: { typeLabel: typeLabel },
				} );

			case 'saveFailure':
				return translate( 'Saving of draft failed.' );

			case 'trashFailure':
				if ( 'page' === type ) {
					return translate( 'Trashing of page failed!' );
				}

				if ( 'post' === type ) {
					return translate( 'Trashing of post failed!' );
				}

				return translate( 'Trashing of %(typeLabel)s failed.', {
					args: { typeLabel: typeLabel },
				} );

			case 'published':
				if ( ! site ) {
					if ( 'page' === type ) {
						return translate( 'Page published!' );
					}

					if ( 'post' === type ) {
						return translate( 'Post published!' );
					}

					return translate( '%(typeLabel)s published!', { args: { typeLabel: typeLabel } } );
				}

				if ( 'page' === type ) {
					return translate( 'Page published on {{pageLink/}}! {{a}}Add another page{{/a}}', {
						components: {
							pageLink: (
								<a href={ postUrl } onClick={ this.handleViewPostClick }>
									{ site.title }
								</a>
							),
							a: <a href={ `/page/${ site.slug }` } onClick={ this.handleAddPagePromptClick } />,
						},
						comment: 'Editor: Message displayed when a page is published, with a link to the page.',
					} );
				}

				if ( 'post' === type ) {
					return translate( 'Post published on {{postLink/}}! {{a}}Add another post{{/a}}', {
						components: {
							postLink: (
								<a href={ postUrl } onClick={ this.handleViewPostClick }>
									{ site.title }
								</a>
							),
							a: <a href={ `/post/${ site.slug }` } onClick={ this.handleAddPagePromptClick } />,
						},
						comment: 'Editor: Message displayed when a post is published, with a link to the post.',
					} );
				}

				return translate( '%(typeLabel)s published on {{postLink/}}!', {
					args: { typeLabel: typeLabel },
					components: {
						postLink: (
							<a href={ postUrl } onClick={ this.handleViewPostClick }>
								{ site.title }
							</a>
						),
					},
					comment:
						'Editor: Message displayed when a post or post of a custom type is published, with a link to the post.',
				} );

			case 'scheduled':
				if ( 'post' === type ) {
					return translate( 'Post scheduled for %(formattedPostDate)s!', {
						args: { formattedPostDate },
						comment:
							'Editor: Message displayed when a post is scheduled, with the scheduled date and time.',
					} );
				}

				if ( 'page' === type ) {
					return translate( 'Page scheduled for %(formattedPostDate)s!', {
						args: { formattedPostDate },
						comment:
							'Editor: Message displayed when a page is scheduled, with the scheduled date and time.',
					} );
				}

				return translate( '%(typeLabel)s scheduled for %(formattedPostDate)s!', {
					args: { typeLabel, formattedPostDate },
					comment:
						'Editor: Message displayed when a post of a custom type is scheduled, with the scheduled date and time.',
				} );

			case 'publishedPrivately':
				return translate(
					'{{strong}}Published privately.{{/strong}} Only admins and editors can view.',
					{
						components: {
							strong: <strong />,
						},
						comment: 'Editor: Message displayed when a post is published privately.',
					}
				);

			case 'view':
				return typeObject.labels.view_item;

			case 'preview':
				return translate( 'View Preview' );

			case 'updated':
				if ( 'page' === type ) {
					return translate( 'Page updated! {{pageLink}}Visit page{{/pageLink}}.', {
						components: {
							pageLink: <a href={ postUrl } onClick={ this.handleViewPostClick } />,
						},
						comment:
							'Editor: Message displayed when a page is updated, with a link to the updated page.',
					} );
				}

				if ( 'post' === type ) {
					return translate( 'Post updated! {{postLink}}Visit post{{/postLink}}.', {
						components: {
							postLink: <a href={ postUrl } onClick={ this.handleViewPostClick } />,
						},
						comment:
							'Editor: Message displayed when a post is updated, with a link to the updated post.',
					} );
				}

				return translate( '%(typeLabel)s updated! {{postLink}}Visit %(typeLabel)s{{/postLink}}.', {
					args: { typeLabel },
					components: {
						postLink: <a href={ postUrl } onClick={ this.handleViewPostClick } />,
					},
					comment:
						'Editor: Message displayed when a post of a custom type is updated, with a link to the updated post.',
				} );
		}
	}

	render() {
		const { siteId, message, status, onDismissClick } = this.props;
		const text = this.getErrorMessage() || this.getText( message );

		return (
			<GlobalNoticesContainer>
				{ siteId && <QueryPostTypes siteId={ siteId } /> }
				{ text && <Notice { ...{ status, text, onDismissClick } } showDismiss /> }
			</GlobalNoticesContainer>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const post = getEditedPost( state, siteId, getEditorPostId( state ) );
		if ( ! post ) {
			return {};
		}

		return {
			siteId,
			site: getSelectedSite( state ),
			type: post.type,
			typeObject: getPostType( state, siteId, post.type ),
			postUrl: post.URL || null,
			postDate: post.date || null,
		};
	},
	{
		setLayoutFocus,
		recordTracksEvent,
	}
)( localize( withLocalizedMoment( EditorNotice ) ) );
