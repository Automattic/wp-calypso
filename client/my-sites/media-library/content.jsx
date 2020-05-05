/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { groupBy, head, isEmpty, map, noop, size, values } from 'lodash';
import PropTypes from 'prop-types';
import page from 'page';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'lib/analytics/tracks';
import { gaRecordEvent } from 'lib/analytics/ga';
import TrackComponentView from 'lib/analytics/track-component-view';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import MediaListData from 'components/data/media-list-data';
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import MediaActions from 'lib/media/actions';
import {
	ValidationErrors as MediaValidationErrors,
	MEDIA_IMAGE_RESIZER,
	MEDIA_IMAGE_THUMBNAIL,
} from 'lib/media/constants';
import canCurrentUser from 'state/selectors/can-current-user';
import { getSiteSlug } from 'state/sites/selectors';
import MediaLibraryHeader from './header';
import MediaLibraryExternalHeader from './external-media-header';
import MediaLibraryList from './list';
import InlineConnection from 'my-sites/marketing/connections/inline-connection';
import {
	isKeyringConnectionsFetching,
	getKeyringConnectionsByName,
} from 'state/sharing/keyring/selectors';
import { pauseGuidedTour, resumeGuidedTour } from 'state/ui/guided-tours/actions';
import { deleteKeyringConnection } from 'state/sharing/keyring/actions';
import { getGuidedTourState } from 'state/ui/guided-tours/selectors';
import { withoutNotice } from 'state/notices/actions';
import { reduxDispatch } from 'lib/redux-bridge';

/**
 * Style dependencies
 */
import './content.scss';

export class MediaLibraryContent extends React.Component {
	static propTypes = {
		site: PropTypes.object,
		mediaValidationErrors: PropTypes.object,
		filter: PropTypes.string,
		filterRequiresUpgrade: PropTypes.bool,
		search: PropTypes.string,
		source: PropTypes.string,
		containerWidth: PropTypes.number,
		single: PropTypes.bool,
		scrollable: PropTypes.bool,
		onAddMedia: PropTypes.func,
		onMediaScaleChange: PropTypes.func,
		onEditItem: PropTypes.func,
		postId: PropTypes.number,
		isConnected: PropTypes.bool,
	};

	static defaultProps = {
		mediaValidationErrors: Object.freeze( {} ),
		onAddMedia: noop,
		source: '',
	};

	componentDidUpdate( prevProps ) {
		if ( this.props.shouldPauseGuidedTour !== prevProps.shouldPauseGuidedTour ) {
			this.props.toggleGuidedTour( this.props.shouldPauseGuidedTour );
		}

		if (
			! this.hasGoogleExpired( prevProps ) &&
			this.hasGoogleExpired( this.props ) &&
			this.props.googleConnection
		) {
			// As soon as we detect Google has expired, remove the connection from the keyring so we
			// are prompted to connect again
			this.props.deleteKeyringConnection( this.props.googleConnection );
		}

		if (
			! this.isGoogleConnectedAndVisible( prevProps ) &&
			this.isGoogleConnectedAndVisible( this.props ) &&
			this.hasGoogleExpired( this.props )
		) {
			// We have transitioned from an invalid Google status to a valid one - migration is complete
			// Force a refresh of the list - this won't happen automatically as we've cached our previous failed query.
			MediaActions.sourceChanged( this.props.site.ID );
		}
	}

	isGoogleConnectedAndVisible( props ) {
		const { googleConnection, source } = props;

		if ( source === 'google_photos' && googleConnection && googleConnection.status === 'ok' ) {
			return true;
		}

		return false;
	}

	hasGoogleExpired( props ) {
		const { mediaValidationErrorTypes, source } = props;

		if (
			source === 'google_photos' &&
			mediaValidationErrorTypes.indexOf( MediaValidationErrors.SERVICE_AUTH_FAILED ) !== -1
		) {
			return true;
		}

		return false;
	}

	renderErrors() {
		const { mediaValidationErrorTypes, site, translate } = this.props;
		return map( groupBy( mediaValidationErrorTypes ), ( occurrences, errorType ) => {
			let message, onDismiss;
			const i18nOptions = {
				count: occurrences.length,
				args: occurrences.length,
			};

			if ( site ) {
				onDismiss = MediaActions.clearValidationErrorsByType.bind( null, site.ID, errorType );
			}

			let status = 'is-error';
			let upgradeNudgeName = undefined;
			let upgradeNudgeFeature = undefined;
			let tryAgain = false;

			switch ( errorType ) {
				case MediaValidationErrors.FILE_TYPE_NOT_IN_PLAN:
					status = 'is-warning';
					upgradeNudgeName = 'plan-media-storage-error-video';
					upgradeNudgeFeature = 'video-upload';
					message = translate(
						'%d file could not be uploaded because your site does not support video files. Upgrade to a premium plan for video support.',
						'%d files could not be uploaded because your site does not support video files. Upgrade to a premium plan for video support.',
						i18nOptions
					);
					break;
				case MediaValidationErrors.FILE_TYPE_UNSUPPORTED:
					message = translate(
						'%d file could not be uploaded because the file type is not supported.',
						'%d files could not be uploaded because their file types are unsupported.',
						i18nOptions
					);
					break;
				case MediaValidationErrors.UPLOAD_VIA_URL_404:
					message = translate(
						'%d file could not be uploaded because no image exists at the specified URL.',
						'%d files could not be uploaded because no images exist at the specified URLs',
						i18nOptions
					);
					break;
				case MediaValidationErrors.EXCEEDS_MAX_UPLOAD_SIZE:
					message = translate(
						'%d file could not be uploaded because it exceeds the maximum upload size.',
						'%d files could not be uploaded because they exceed the maximum upload size.',
						i18nOptions
					);
					break;
				case MediaValidationErrors.NOT_ENOUGH_SPACE:
					upgradeNudgeName = 'plan-media-storage-error';
					upgradeNudgeFeature = 'extra-storage';
					message = translate(
						'%d file could not be uploaded because there is not enough space left.',
						'%d files could not be uploaded because there is not enough space left.',
						i18nOptions
					);
					break;
				case MediaValidationErrors.EXCEEDS_PLAN_STORAGE_LIMIT:
					upgradeNudgeName = 'plan-media-storage-error';
					upgradeNudgeFeature = 'extra-storage';
					message = translate(
						'%d file could not be uploaded because you have reached your plan storage limit.',
						'%d files could not be uploaded because you have reached your plan storage limit.',
						i18nOptions
					);
					break;
				case MediaValidationErrors.SERVICE_AUTH_FAILED:
					message = this.getAuthFailMessageForSource();
					status = 'is-warning';
					tryAgain = false;
					break;

				case MediaValidationErrors.SERVICE_FAILED:
					message = translate( 'We are unable to retrieve your full media library.' );
					tryAgain = true;
					break;
				default:
					message = translate(
						'%d file could not be uploaded because an error occurred while uploading.',
						'%d files could not be uploaded because errors occurred while uploading.',
						i18nOptions
					);
					break;
			}

			return (
				<Notice key={ errorType } status={ status } text={ message } onDismissClick={ onDismiss }>
					{ this.renderNoticeAction( upgradeNudgeName, upgradeNudgeFeature ) }
					{ tryAgain && this.renderTryAgain() }
				</Notice>
			);
		} );
	}

	getAuthFailMessageForSource() {
		const { translate, source } = this.props;

		if ( source === 'google_photos' ) {
			return translate(
				'We are moving to a new and faster Photos from Google service. Please reconnect to continue accessing your photos.'
			);
		}

		// Generic message. Nothing should use this, but just in case.
		return translate( 'Your service has been disconnected. Please reconnect to continue.' );
	}

	renderTryAgain() {
		return (
			<NoticeAction onClick={ this.retryList }>{ this.props.translate( 'Retry' ) }</NoticeAction>
		);
	}

	retryList = () => {
		MediaActions.sourceChanged( this.props.site.ID );
	};

	renderNoticeAction( upgradeNudgeName, upgradeNudgeFeature ) {
		if ( ! upgradeNudgeName ) {
			return null;
		}
		const eventName = 'calypso_upgrade_nudge_impression';
		const eventProperties = {
			cta_name: upgradeNudgeName,
			cta_feature: upgradeNudgeFeature,
		};
		return (
			<NoticeAction
				external={ true }
				href={
					upgradeNudgeFeature
						? `/plans/compare/${ this.props.siteSlug }?feature=${ upgradeNudgeFeature }`
						: `/plans/${ this.props.siteSlug }`
				}
				onClick={ this.recordPlansNavigation.bind(
					this,
					'calypso_upgrade_nudge_cta_click',
					eventProperties
				) }
			>
				{ this.props.translate( 'Upgrade Plan' ) }
				<TrackComponentView eventName={ eventName } eventProperties={ eventProperties } />
			</NoticeAction>
		);
	}

	recordPlansNavigation( tracksEvent, tracksData ) {
		gaRecordEvent( 'Media', 'Clicked Upload Error Action' );
		recordTracksEvent( tracksEvent, tracksData );
	}

	goToSharing = ( ev ) => {
		ev.preventDefault();
		page( `/marketing/connections/${ this.props.site.slug }` );
	};

	renderGooglePhotosConnect() {
		const connectMessage = this.props.translate(
			'To show your Google Photos library you need to connect your Google account.'
		);

		return (
			<div className="media-library__connect-message">
				<p>
					<img src="/calypso/images/sharing/google-photos-connect.png" width="400" alt="" />
				</p>
				<p>{ connectMessage }</p>

				<InlineConnection serviceName="google_photos" />
			</div>
		);
	}

	renderConnectExternalMedia() {
		const { source } = this.props;
		switch ( source ) {
			case 'google_photos':
				return this.renderGooglePhotosConnect();
		}
		return null;
	}

	getThumbnailType() {
		return this.props.source !== '' ? MEDIA_IMAGE_THUMBNAIL : MEDIA_IMAGE_RESIZER;
	}

	needsToBeConnected() {
		const { source, isConnected } = this.props;

		// We're on an external service and not connected - need connecting
		if ( source !== '' && ! isConnected ) {
			return true;
		}

		// We're think we're connected to an external service but are really expired
		if ( source !== '' && isConnected && this.hasGoogleExpired( this.props ) ) {
			return true;
		}

		// We're on an internal service, or an external service that is connected and not expired
		return false;
	}

	renderMediaList() {
		if ( ! this.props.site || ( this.props.isRequesting && ! this.hasRequested ) ) {
			this.hasRequested = true; // We only want to do this once
			return (
				<MediaLibraryList
					key="list-loading"
					filterRequiresUpgrade={ this.props.filterRequiresUpgrade }
				/>
			);
		}

		if ( this.needsToBeConnected() ) {
			return this.renderConnectExternalMedia();
		}

		return (
			<MediaListData
				siteId={ this.props.site.ID }
				postId={ this.props.postId }
				filter={ this.props.filter }
				search={ this.props.search }
				source={ this.props.source }
			>
				<MediaLibrarySelectedData siteId={ this.props.site.ID }>
					<MediaLibraryList
						key={ 'list-' + [ this.props.site.ID, this.props.search, this.props.filter ].join() }
						site={ this.props.site }
						filter={ this.props.filter }
						filterRequiresUpgrade={ this.props.filterRequiresUpgrade }
						search={ this.props.search }
						containerWidth={ this.props.containerWidth }
						thumbnailType={ this.getThumbnailType() }
						single={ this.props.single }
						scrollable={ this.props.scrollable }
						onEditItem={ this.props.onEditItem }
					/>
				</MediaLibrarySelectedData>
			</MediaListData>
		);
	}

	renderHeader() {
		if ( this.needsToBeConnected() ) {
			return null;
		}

		if ( this.props.source !== '' ) {
			return (
				<MediaLibraryExternalHeader
					onMediaScaleChange={ this.props.onMediaScaleChange }
					site={ this.props.site }
					visible={ ! this.props.isRequesting }
					canCopy={ this.props.postId === undefined }
					source={ this.props.source }
					onSourceChange={ this.props.onSourceChange }
					selectedItems={ this.props.selectedItems }
					sticky={ ! this.props.scrollable }
					hasAttribution={ 'pexels' === this.props.source }
					hasRefreshButton={ 'pexels' !== this.props.source }
				/>
			);
		}

		if ( ! this.props.filterRequiresUpgrade ) {
			return (
				<MediaLibraryHeader
					site={ this.props.site }
					filter={ this.props.filter }
					onMediaScaleChange={ this.props.onMediaScaleChange }
					onAddMedia={ this.props.onAddMedia }
					onAddAndEditImage={ this.props.onAddAndEditImage }
					selectedItems={ this.props.selectedItems }
					onViewDetails={ this.props.onViewDetails }
					onDeleteItem={ this.props.onDeleteItem }
					sticky={ ! this.props.scrollable }
				/>
			);
		}

		return null;
	}

	render() {
		const classNames = classnames( 'media-library__content', {
			'has-no-upload-button': ! this.props.displayUploadMediaButton,
		} );

		return (
			<div className={ classNames }>
				{ this.renderHeader() }
				{ this.renderErrors() }
				{ this.renderMediaList() }
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const guidedTourState = getGuidedTourState( state );
		const mediaValidationErrorTypes = values( ownProps.mediaValidationErrors ).map( head );
		const shouldPauseGuidedTour =
			! isEmpty( guidedTourState.tour ) && 0 < size( mediaValidationErrorTypes );
		const googleConnection = getKeyringConnectionsByName( state, 'google_photos' );

		return {
			siteSlug: ownProps.site ? getSiteSlug( state, ownProps.site.ID ) : '',
			isRequesting: isKeyringConnectionsFetching( state ),
			displayUploadMediaButton: canCurrentUser( state, ownProps.site.ID, 'publish_posts' ),
			mediaValidationErrorTypes,
			shouldPauseGuidedTour,
			googleConnection: googleConnection.length === 1 ? googleConnection[ 0 ] : null, // There can be only one
		};
	},
	() => ( {
		toggleGuidedTour: ( shouldPause ) => {
			// We're using `reduxDispatch` to avoid dispatch clashes with the media data Flux implementation.
			// The eventual Reduxification of the media store should prevent this. See: #26168
			reduxDispatch( shouldPause ? pauseGuidedTour() : resumeGuidedTour() );
		},
		deleteKeyringConnection: ( connection ) => {
			// We don't want this to trigger a global notice - a notice is shown inline
			const deleteKeyring = withoutNotice( () => deleteKeyringConnection( connection ) );

			reduxDispatch( deleteKeyring() );
		},
	} ),
	null,
	{ pure: false }
)( localize( MediaLibraryContent ) );
