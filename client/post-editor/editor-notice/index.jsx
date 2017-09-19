/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryPostTypes from 'components/data/query-post-types';
import Notice from 'components/notice';
import { isMobile } from 'lib/viewport';
import { getPostType } from 'state/post-types/selectors';
import { getEditedPost } from 'state/posts/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { getSelectedSiteId, getSelectedSite } from 'state/ui/selectors';

export class EditorNotice extends Component {
	static propTypes = {
		translate: PropTypes.func,
		siteId: PropTypes.number,
		site: PropTypes.object,
		type: PropTypes.string,
		typeObject: PropTypes.object,
		message: PropTypes.string,
		status: PropTypes.string,
		onDismissClick: PropTypes.func,
		error: PropTypes.object
	}

	componentWillReceiveProps( nextProps ) {
		if ( isMobile() &&
			( ( ! this.props.message && nextProps.message ) || ( ! this.props.error && nextProps.error ) ) ) {
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
				return translate( 'You haven\'t written anything yet!' );
		}
	}

	getText( key ) {
		const { translate, type, typeObject, site } = this.props;

		switch ( key ) {
			case 'warnPublishDateChange':
				return translate( 'Are you sure about that? If you change the date, existing links to your post will stop working.' );
			case 'publishFailure':
				if ( 'page' === type ) {
					return translate( 'Publishing of page failed.' );
				}

				return translate( 'Publishing of post failed.' );

			case 'saveFailure':
				return translate( 'Saving of draft failed.' );

			case 'trashFailure':
				if ( 'page' === type ) {
					return translate( 'Trashing of page failed.' );
				}

				return translate( 'Trashing of post failed.' );

			case 'published':
				if ( ! site ) {
					if ( 'page' === type ) {
						return translate( 'Page published!' );
					}

					return translate( 'Post published!' );
				}

				if ( 'page' === type ) {
					return translate( 'Page published on {{siteLink/}}! {{a}}Add another page{{/a}}', {
						components: {
							siteLink: <a href={ site.URL } target="_blank" rel="noopener noreferrer">{ site.title }</a>,
							a: <a href={ `/page/${ site.slug }` } />,
						},
						comment: 'Editor: Message displayed when a page is published, with a link to the site it was published on.'
					} );
				}

				return translate( 'Post published on {{siteLink/}}!', {
					components: {
						siteLink: <a href={ site.URL } target="_blank" rel="noopener noreferrer">{ site.title }</a>
					},
					comment: 'Editor: Message displayed when a post is published, with a link to the site it was published on.'
				} );

			case 'scheduled':
				if ( ! site ) {
					if ( 'page' === type ) {
						return translate( 'Page scheduled!' );
					}

					return translate( 'Post scheduled!' );
				}

				if ( 'page' === type ) {
					return translate( 'Page scheduled on {{siteLink/}}! {{a}}Add another page{{/a}}', {
						components: {
							siteLink: <a href={ site.URL } target="_blank" rel="noopener noreferrer">{ site.title }</a>,
							a: <a href={ `/page/${ site.slug }` } />,
						},
						comment: 'Editor: Message displayed when a page is scheduled, with a link to the site it was scheduled on.'
					} );
				}

				return translate( 'Post scheduled on {{siteLink/}}!', {
					components: {
						siteLink: <a href={ site.URL } target="_blank" rel="noopener noreferrer">{ site.title }</a>
					},
					comment: 'Editor: Message displayed when a post is scheduled, with a link to the site it was scheduled on.'
				} );

			case 'publishedPrivately':
				return translate( '{{strong}}Published privately.{{/strong}} Only admins and editors can view.', {
					components: {
						strong: <strong />,
					},
					comment: 'Editor: Message displayed when a post is published privately.',
				} );

			case 'view':
				if ( 'page' === type ) {
					return translate( 'View Page' );
				} else if ( 'post' !== type && typeObject ) {
					return typeObject.labels.view_item;
				}

				return translate( 'View Post' );

			case 'preview':
				return translate( 'View Preview' );

			case 'updated':
				if ( ! site ) {
					if ( 'page' === type ) {
						return translate( 'Page updated!' );
					}

					return translate( 'Post updated!' );
				}

				if ( 'page' === type ) {
					return translate( 'Page updated on {{siteLink/}}! {{a}}Add another page{{/a}}', {
						components: {
							siteLink: <a href={ site.URL } target="_blank" rel="noopener noreferrer">{ site.title }</a>,
							a: <a href={ `/page/${ site.slug }` } />,
						},
						comment: 'Editor: Message displayed when a page is updated, with a link to the site it was updated on.'
					} );
				}

				return translate( 'Post updated on {{siteLink/}}!', {
					components: {
						siteLink: <a href={ site.URL } target="_blank" rel="noopener noreferrer">{ site.title }</a>
					},
					comment: 'Editor: Message displayed when a post is updated, with a link to the site it was updated on.'
				} );
		}
	}

	render() {
		const { siteId, message, status, onDismissClick } = this.props;
		const text = this.getErrorMessage() || this.getText( message );

		return (
			<div className={ classNames( 'editor-notice', { 'is-global': true } ) }>
				{ siteId && <QueryPostTypes siteId={ siteId } /> }
				{ text && (
					<Notice
						{ ...{ status, text, onDismissClick } }
						showDismiss={ true }
					>
					</Notice>
				) }
			</div>
		);
	}
}

export default connect( ( state ) => {
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
	};
}, { setLayoutFocus } )( localize( EditorNotice ) );
