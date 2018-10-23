/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { groupBy, head, isEmpty, map, noop, size, values } from 'lodash';
import PropTypes from 'prop-types';
import page from 'page';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
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
import { getSiteSlug } from 'state/sites/selectors';
import MediaLibraryHeader from './header';
import MediaLibraryExternalHeader from './external-media-header';
import MediaLibraryList from './list';
import InlineConnection from 'my-sites/sharing/connections/inline-connection';
import { isKeyringConnectionsFetching } from 'state/sharing/keyring/selectors';
import { pauseGuidedTour, resumeGuidedTour } from 'state/ui/guided-tours/actions';
import { getGuidedTourState } from 'state/ui/guided-tours/selectors';

class MediaLibraryContent extends React.Component {
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
		analytics.ga.recordEvent( 'Media', 'Clicked Upload Error Action' );
		analytics.tracks.recordEvent( tracksEvent, tracksData );
	}

	goToSharing = ev => {
		ev.preventDefault();
		page( `/sharing/${ this.props.site.slug }` );
	};

	renderGooglePhotosConnect() {
		const connectMessage = this.props.translate(
			'To show Photos from Google, you need to connect your Google account.'
		);

		return (
			<div className="media-library__connect-message">
				<p>
					<Gridicon icon="image" size={ 72 } />
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
		return this.props.source !== '' && ! this.props.isConnected;
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
		if ( ! this.props.isConnected && this.needsToBeConnected() ) {
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
		return (
			<div className="media-library__content">
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
		return {
			siteSlug: ownProps.site ? getSiteSlug( state, ownProps.site.ID ) : '',
			isRequesting: isKeyringConnectionsFetching( state ),
			mediaValidationErrorTypes,
			shouldPauseGuidedTour,
		};
	},
	dispatch => ( {
		toggleGuidedTour: shouldPause =>
			// We're wrapping this in a `setTimeout` to avoid dispatch clashes with the media data Flux implementation.
			// The eventual Reduxification of the media store should prevent this. See: #26168
			setTimeout( () => dispatch( shouldPause ? pauseGuidedTour() : resumeGuidedTour() ), 0 ),
	} ),
	null,
	{ pure: false }
)( localize( MediaLibraryContent ) );
