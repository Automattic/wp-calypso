/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flow } from 'lodash';

/**
 * Internal dependencies
 */
import { savePost, trashPost, restorePost } from 'state/posts/actions';

const enhance = flow( localize, connect( null, { savePost, trashPost, restorePost } ) );

const updatePostStatus = WrappedComponent =>
	enhance(
		class UpdatePostStatus extends Component {
			static displayName = `UpdatePostStatus(${ WrappedComponent.displayName ||
				WrappedComponent.name ||
				'' })`;

			static propTypes = {
				translate: PropTypes.func.isRequired,
				post: PropTypes.object,
				page: PropTypes.object,
			};

			state = {
				showPageActions: false,
			};

			updatePostStatus = status => {
				const { translate } = this.props;
				const post = this.props.post || this.props.page;

				this.setState( { showPageActions: false } );

				switch ( status ) {
					case 'delete':
						const deleteWarning = this.props.post
							? translate( 'Delete this post permanently?' )
							: translate( 'Delete this page permanently?' );

						if ( typeof window === 'object' && window.confirm( deleteWarning ) ) {
							this.props
								.deletePost( post.site_ID, post.ID )
								.then( this.resetState, this.resetState );
						} else {
							this.resetState();
						}
						return;

					case 'trash':
						this.props.trashPost( post.site_ID, post.ID ).then( this.resetState, this.resetState );
						return;

					case 'restore':
						this.props
							.restorePost( post.site_ID, post.ID )
							.then( this.resetState, this.resetState );
						return;

					default:
						this.props
							.savePost( post.site_ID, post.ID, { status } )
							.then( this.resetState, this.resetState );
				}
			};

			resetState = () => {
				this.setState( { showPageActions: true } );
			};

			togglePageActions = () => {
				this.setState( { showPageActions: ! this.state.showPageActions } );
			};

			render() {
				return (
					<WrappedComponent
						{ ...this.props }
						togglePageActions={ this.togglePageActions }
						updatePostStatus={ this.updatePostStatus }
						showPageActions={ this.state.showPageActions }
					/>
				);
			}
		}
	);

export default updatePostStatus;
