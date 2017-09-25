/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { groupBy, head, mapValues, noop, values } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';
import createFragment from 'react-addons-create-fragment';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import MediaLibraryExternalHeader from './external-media-header';
import MediaLibraryHeader from './header';
import MediaLibraryList from './list';
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import MediaListData from 'components/data/media-list-data';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import analytics from 'lib/analytics';
import TrackComponentView from 'lib/analytics/track-component-view';
import MediaActions from 'lib/media/actions';
import { ValidationErrors as MediaValidationErrors, MEDIA_IMAGE_PHOTON, MEDIA_IMAGE_RESIZER, MEDIA_IMAGE_THUMBNAIL } from 'lib/media/constants';
import InlineConnection from 'my-sites/sharing/connections/inline-connection';
import { isKeyringConnectionsFetching } from 'state/sharing/keyring/selectors';
import { getSiteSlug } from 'state/sites/selectors';

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
	}

	renderErrors() {
		const errorTypes = values( this.props.mediaValidationErrors ).map( head );
		const notices = mapValues( groupBy( errorTypes ), ( occurrences, errorType ) => {
			let message, onDismiss;
			const i18nOptions = {
				count: occurrences.length,
				args: occurrences.length
			};

			if ( this.props.site ) {
				onDismiss = MediaActions.clearValidationErrorsByType.bind( null, this.props.site.ID, errorType );
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
					message = this.props.translate(
						'%d file could not be uploaded because your site does not support video files. Upgrade to a premium plan for video support.', // eslint-disable-line max-len
						'%d files could not be uploaded because your site does not support video files. Upgrade to a premium plan for video support.', // eslint-disable-line max-len
						i18nOptions
					);
					break;
				case MediaValidationErrors.FILE_TYPE_UNSUPPORTED:
					message = this.props.translate(
						'%d file could not be uploaded because the file type is not supported.',
						'%d files could not be uploaded because their file types are unsupported.',
						i18nOptions
					);
					break;
				case MediaValidationErrors.UPLOAD_VIA_URL_404:
					message = this.props.translate(
						'%d file could not be uploaded because no image exists at the specified URL.',
						'%d files could not be uploaded because no images exist at the specified URLs',
						i18nOptions
					);
					break;
				case MediaValidationErrors.EXCEEDS_MAX_UPLOAD_SIZE:
					message = this.props.translate(
						'%d file could not be uploaded because it exceeds the maximum upload size.',
						'%d files could not be uploaded because they exceed the maximum upload size.',
						i18nOptions
					);
					break;
				case MediaValidationErrors.NOT_ENOUGH_SPACE:
					upgradeNudgeName = 'plan-media-storage-error';
					upgradeNudgeFeature = 'extra-storage';
					message = this.props.translate(
						'%d file could not be uploaded because there is not enough space left.',
						'%d files could not be uploaded because there is not enough space left.',
						i18nOptions
					);
					break;
				case MediaValidationErrors.EXCEEDS_PLAN_STORAGE_LIMIT:
					upgradeNudgeName = 'plan-media-storage-error';
					upgradeNudgeFeature = 'extra-storage';
					message = this.props.translate(
						'%d file could not be uploaded because you have reached your plan storage limit.',
						'%d files could not be uploaded because you have reached your plan storage limit.',
						i18nOptions
					);
					break;
				case MediaValidationErrors.SERVICE_FAILED:
					message = this.props.translate( 'We are unable to retrieve your full media library.' );
					tryAgain = true;
					break;
				default:
					message = this.props.translate(
						'%d file could not be uploaded because an error occurred while uploading.',
						'%d files could not be uploaded because errors occurred while uploading.',
						i18nOptions
					);
					break;
			}

			return (
				<Notice status={ status } text={ message } onDismissClick={ onDismiss } >
					{ this.renderNoticeAction( upgradeNudgeName, upgradeNudgeFeature ) }
					{ tryAgain && this.renderTryAgain() }
				</Notice>
			);
		} );

		return createFragment( notices );
	}

	renderTryAgain() {
		return (
			<NoticeAction onClick={ this.retryList }>
				{ this.props.translate( 'Retry' ) }
			</NoticeAction>
		);
	}

	retryList = () => {
		MediaActions.sourceChanged( this.props.site.ID );
	}

	renderNoticeAction( upgradeNudgeName, upgradeNudgeFeature ) {
		if ( ! upgradeNudgeName ) {
			return null;
		}
		const eventName = 'calypso_upgrade_nudge_impression';
		const eventProperties = {
			cta_name: upgradeNudgeName,
			cta_feature: upgradeNudgeFeature
		};
		return (
			<NoticeAction
				external={ true }
				href={ upgradeNudgeFeature ? `/plans/compare/${ this.props.siteSlug }?feature=${ upgradeNudgeFeature }` : `/plans/${ this.props.siteSlug }` }
				onClick={ this.recordPlansNavigation.bind( this, 'calypso_upgrade_nudge_cta_click', eventProperties ) }>
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
	}

	renderExternalMedia() {
		const connectMessage = this.props.translate(
			'To show Photos from Google, you need to connect your Google account.'
		);

		return (
			<div className="media-library__connect-message">
				<p><img src="/calypso/images/sharing/google-photos-logo.svg" width="96" height="96" /></p>
				<p>{ connectMessage }</p>

				<InlineConnection serviceName="google_photos" />
			</div>
		);
	}

	getThumbnailType() {
		if ( this.props.source !== '' ) {
			return MEDIA_IMAGE_THUMBNAIL;
		}

		if ( this.props.site.is_private ) {
			return MEDIA_IMAGE_RESIZER;
		}

		return MEDIA_IMAGE_PHOTON;
	}

	renderMediaList() {
		if ( ! this.props.site || ( this.props.isRequesting && ! this.hasRequested ) ) {
			this.hasRequested = true;   // We only want to do this once
			return <MediaLibraryList key="list-loading" filterRequiresUpgrade={ this.props.filterRequiresUpgrade } />;
		}

		if ( this.props.source !== '' && ! this.props.isConnected ) {
			return this.renderExternalMedia();
		}

		return (
			<MediaListData
				siteId={ this.props.site.ID }
				postId={ this.props.postId }
				filter={ this.props.filter }
				search={ this.props.search }
				source={ this.props.source }>
				<MediaLibrarySelectedData siteId={ this.props.site.ID }>
					<MediaLibraryList
						key={ 'list-' + ( [ this.props.site.ID, this.props.search, this.props.filter ].join() ) }
						site={ this.props.site }
						filter={ this.props.filter }
						filterRequiresUpgrade={ this.props.filterRequiresUpgrade }
						search={ this.props.search }
						containerWidth={ this.props.containerWidth }
						thumbnailType={ this.getThumbnailType() }
						single={ this.props.single }
						scrollable={ this.props.scrollable }
						onEditItem={ this.props.onEditItem } />
				</MediaLibrarySelectedData>
			</MediaListData>
		);
	}

	renderHeader() {
		if ( ! this.props.isConnected ) {
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

export default connect( ( state, ownProps ) => ( {
	siteSlug: ownProps.site ? getSiteSlug( state, ownProps.site.ID ) : '',
	isRequesting: isKeyringConnectionsFetching( state ),
} ), null, null, { pure: false } )( localize( MediaLibraryContent ) );
