/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import { getSelectedSiteId, getSelectedSite } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPost } from 'state/posts/selectors';
import { getPostType } from 'state/post-types/selectors';
import QueryPostTypes from 'components/data/query-post-types';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { isMobile } from 'lib/viewport';

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
		error: PropTypes.object,
	};

	componentWillReceiveProps( nextProps ) {
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
		/* eslint-disable max-len */
		const { translate, type, typeObject, site } = this.props;
		const typeLabel = typeObject && typeObject.labels.singular_name;

		switch ( key ) {
			case 'warnPublishDateChange':
				// This message can only appear for type === 'post'.  See
				// PostEditor#checkForDateChange().
				return translate(
					'Are you sure about that? If you change the date, existing links to your post will stop working.'
				);

			case 'publishFailure':
				if ( 'page' === type ) {
					return translate( 'Publishing of page failed.' );
				}

				if ( 'post' !== type && typeLabel ) {
					return translate( 'Publishing of %(typeLabel)s failed.', { args: { typeLabel } } );
				}

				return translate( 'Publishing of post failed.' );

			case 'saveFailure':
				return translate( 'Saving of draft failed.' );

			case 'trashFailure':
				if ( 'page' === type ) {
					return translate( 'Trashing of page failed.' );
				}

				if ( 'post' !== type && typeLabel ) {
					return translate( 'Trashing of %(typeLabel)s failed.', { args: { typeLabel } } );
				}

				return translate( 'Trashing of post failed.' );

			case 'published':
				if ( ! site ) {
					if ( 'page' === type ) {
						return translate( 'Page published!' );
					}

					if ( 'post' !== type && typeLabel ) {
						return translate( '%(typeLabel)s published!', { args: { typeLabel } } );
					}

					return translate( 'Post published!' );
				}

				if ( 'page' === type ) {
					return translate( 'Page published on {{siteLink/}}! {{a}}Add another page{{/a}}', {
						components: {
							siteLink: (
								<a href={ site.URL } target="_blank" rel="noopener noreferrer">
									{ site.title }
								</a>
							),
							a: <a href={ `/page/${ site.slug }` } />,
						},
						comment:
							'Editor: Message displayed when a page is published, with a link to the site it was published on.',
					} );
				}

				if ( 'post' !== type && typeLabel ) {
					return translate( '%(typeLabel)s published on {{siteLink/}}!', {
						args: { typeLabel },
						components: {
							siteLink: (
								<a href={ site.URL } target="_blank" rel="noopener noreferrer">
									{ site.title }
								</a>
							),
						},
						comment:
							'Editor: Message displayed when a post of a custom type is published, with a link to the site it was published on.',
					} );
				}

				return translate( 'Post published on {{siteLink/}}!', {
					components: {
						siteLink: (
							<a href={ site.URL } target="_blank" rel="noopener noreferrer">
								{ site.title }
							</a>
						),
					},
					comment:
						'Editor: Message displayed when a post is published, with a link to the site it was published on.',
				} );

			case 'scheduled':
				if ( ! site ) {
					if ( 'page' === type ) {
						return translate( 'Page scheduled!' );
					}

					if ( 'post' !== type && typeLabel ) {
						return translate( '%(typeLabel)s scheduled!', { args: { typeLabel } } );
					}

					return translate( 'Post scheduled!' );
				}

				if ( 'page' === type ) {
					return translate( 'Page scheduled on {{siteLink/}}! {{a}}Add another page{{/a}}', {
						components: {
							siteLink: (
								<a href={ site.URL } target="_blank" rel="noopener noreferrer">
									{ site.title }
								</a>
							),
							a: <a href={ `/page/${ site.slug }` } />,
						},
						comment:
							'Editor: Message displayed when a page is scheduled, with a link to the site it was scheduled on.',
					} );
				}

				if ( 'post' !== type && typeLabel ) {
					return translate( '%(typeLabel)s scheduled on {{siteLink/}}!', {
						args: { typeLabel },
						components: {
							siteLink: (
								<a href={ site.URL } target="_blank" rel="noopener noreferrer">
									{ site.title }
								</a>
							),
						},
						comment:
							'Editor: Message displayed when a post of a custom type is scheduled, with a link to the site it was scheduled on.',
					} );
				}

				return translate( 'Post scheduled on {{siteLink/}}!', {
					components: {
						siteLink: (
							<a href={ site.URL } target="_blank" rel="noopener noreferrer">
								{ site.title }
							</a>
						),
					},
					comment:
						'Editor: Message displayed when a post is scheduled, with a link to the site it was scheduled on.',
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
				if ( 'page' === type ) {
					return translate( 'View Page' );
				}

				if ( 'post' !== type && typeObject ) {
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

					if ( 'post' !== type && typeLabel ) {
						return translate( '%(typeLabel)s updated!', { args: { typeLabel } } );
					}

					return translate( 'Post updated!' );
				}

				if ( 'page' === type ) {
					return translate( 'Page updated on {{siteLink/}}! {{a}}Add another page{{/a}}', {
						components: {
							siteLink: (
								<a href={ site.URL } target="_blank" rel="noopener noreferrer">
									{ site.title }
								</a>
							),
							a: <a href={ `/page/${ site.slug }` } />,
						},
						comment:
							'Editor: Message displayed when a page is updated, with a link to the site it was updated on.',
					} );
				}

				if ( 'post' !== type && typeLabel ) {
					return translate( '%(typeLabel)s updated on {{siteLink/}}!', {
						args: { typeLabel },
						components: {
							siteLink: (
								<a href={ site.URL } target="_blank" rel="noopener noreferrer">
									{ site.title }
								</a>
							),
						},
						comment:
							'Editor: Message displayed when a post of a custom type is updated, with a link to the site it was updated on.',
					} );
				}

				return translate( 'Post updated on {{siteLink/}}!', {
					components: {
						siteLink: (
							<a href={ site.URL } target="_blank" rel="noopener noreferrer">
								{ site.title }
							</a>
						),
					},
					comment:
						'Editor: Message displayed when a post is updated, with a link to the site it was updated on.',
				} );
		}
		/* eslint-enable max-len */
	}

	render() {
		const { siteId, message, status, onDismissClick } = this.props;
		const text = this.getErrorMessage() || this.getText( message );

		return (
			<div className={ classNames( 'editor-notice', { 'is-global': true } ) }>
				{ siteId && <QueryPostTypes siteId={ siteId } /> }
				{ text && <Notice { ...{ status, text, onDismissClick } } showDismiss={ true } /> }
			</div>
		);
	}
}

export default connect(
	state => {
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
	},
	{ setLayoutFocus }
)( localize( EditorNotice ) );
