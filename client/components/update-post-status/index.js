/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flow, get, once } from 'lodash';

/**
 * Internal dependencies
 */
import { getSite } from 'state/sites/selectors';
import UpdateTemplate from './update-template';
import PostActions from 'lib/posts/actions';
import { recordGoogleEvent } from 'state/analytics/actions';

const RESET_TIMEOUT_MS = 1200;

const getStrings = once( translate => ( {
	page: {
		deleteWarning: translate( 'Delete this page permanently?' ),
		deleted: translate( 'Page Deleted' ),
		deleting: translate( 'Deleting Page' ),
		error: translate( 'Error' ),
		restored: translate( 'Page Restored' ),
		restoring: translate( 'Restoring Page' ),
		trashed: translate( 'Moved to Trash' ),
		trashing: translate( 'Trashing Page' ),
		undo: translate( 'undo?' ),
		updated: translate( 'Updated' ),
		updating: translate( 'Updating Page' ),
	},
	post: {
		deleteWarning: translate( 'Delete this post permanently?' ),
		deleted: translate( 'Post Deleted' ),
		deleting: translate( 'Deleting Post' ),
		error: translate( 'Error' ),
		restored: translate( 'Restored' ),
		restoring: translate( 'Restoring' ),
		trashed: translate( 'Moved to Trash' ),
		trashing: translate( 'Trashing Post' ),
		undo: translate( 'undo?' ),
		updated: translate( 'Updated' ),
		updating: translate( 'Updating Post' ),
	},
} ) );

const enhance = flow(
	localize,
	connect(
		( state, props ) => ( {
			site: getSite( state, get( props, 'post.site_ID' ) ),
		} ),
		{ recordGoogleEvent }
	)
);

const updatePostStatus = WrappedComponent =>
	enhance(
		class UpdatePostStatus extends Component {
			static displayName = `UpdatePostStatus(${ WrappedComponent.displayName ||
				WrappedComponent.name ||
				'' })`;

			static propTypes = {
				translate: PropTypes.func.isRequired,
				recordGoogleEvent: PropTypes.func.isRequired,
				post: PropTypes.object,
				page: PropTypes.object,
			};

			state = {
				updated: false,
				updatedStatus: null,
				previousStatus: null,
				showMoreOptions: false,
				showPageActions: false,
			};

			getType() {
				return this.props.page ? 'page' : 'post';
			}

			buildUpdateTemplate = () => {
				if ( ! this.state.updated ) {
					return;
				}

				const strings = getStrings( this.props.translate );

				return (
					<UpdateTemplate
						post={ this.props.post || this.props.page }
						previousStatus={ this.state.previousStatus }
						resetToPreviousState={ this.resetToPreviousState }
						status={ this.state.updatedStatus }
						strings={ strings[ this.getType() ] }
					/>
				);
			};

			updatePostStatus = status => {
				const { site } = this.props;
				const post = this.props.post || this.props.page;
				let previousStatus = null;

				const setNewStatus = ( error, resultPost ) => {
					if ( error ) {
						this.setErrorState();
						return false;
					}

					this.setState( {
						previousStatus,
						updatedStatus: resultPost.status,
						showMoreOptions: false,
					} );
					return true;
				};

				switch ( status ) {
					case 'delete':
						this.setState( {
							showPageActions: false,
							updatedStatus: 'deleting',
							updated: true,
						} );

						const strings = getStrings( this.props.translate );
						const type = this.props.post ? 'post' : 'page';

						if ( typeof window === 'object' && window.confirm( strings[ type ].deleteWarning ) ) {
							// eslint-disable-line no-alert
							PostActions.trash( post, setNewStatus );
						} else {
							this.resetState();
						}
						return;

					case 'trash':
						this.setState( {
							showPageActions: false,
							updatedStatus: 'trashing',
							updated: true,
						} );
						previousStatus = post.status;
						PostActions.trash( post, setNewStatus, site );
						return;

					case 'restore':
						this.setState( {
							showPageActions: false,
							updatedStatus: 'restoring',
							updated: true,
						} );
						previousStatus = 'trash';
						PostActions.restore( post, setNewStatus, site );
						return;

					default:
						this.setState( {
							showPageActions: false,
							updatedStatus: 'updating',
							updated: true,
						} );
						PostActions.update(
							post,
							{ status },
							( error, resultPost ) => {
								if ( ! setNewStatus( error, resultPost ) ) {
									return;
								}
								setTimeout( this.resetState, RESET_TIMEOUT_MS );
							},
							site
						);
				}
			};

			resetState = () => {
				this.setState( {
					updatedStatus: null,
					updated: false,
					showMoreOptions: false,
					showPageActions: false,
				} );
			};

			resetToPreviousState = () => {
				const [ group, eventName ] =
					this.getType() === 'page'
						? [ 'Pages', 'Clicked Undo Trashed Page' ]
						: [ 'Posts', 'Clicked Undo Trashed Post' ];

				this.props.recordGoogleEvent( group, eventName );
				if ( this.state.previousStatus ) {
					this.updatePostStatus( this.state.previousStatus );
				}
			};

			togglePageActions = () => {
				this.setState( { showPageActions: ! this.state.showPageActions } );
			};

			showMoreControls = () => {
				this.setState( { showMoreOptions: true } );
			};

			hideMoreControls = () => {
				this.setState( { showMoreOptions: false } );
			};

			setErrorState() {
				this.setState( {
					updated: true,
					updatedStatus: 'error',
				} );
				setTimeout( this.resetState, RESET_TIMEOUT_MS );
			}

			render() {
				return (
					<WrappedComponent
						{ ...this.props }
						buildUpdateTemplate={ this.buildUpdateTemplate }
						togglePageActions={ this.togglePageActions }
						showMoreControls={ this.showMoreControls }
						hideMoreControls={ this.hideMoreControls }
						updatePostStatus={ this.updatePostStatus }
						{ ...this.state }
					/>
				);
			}
		}
	);

export default updatePostStatus;
