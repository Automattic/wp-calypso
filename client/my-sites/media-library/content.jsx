/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import createFragment from 'react-addons-create-fragment';
import noop from 'lodash/noop';
import head from 'lodash/head';
import values from 'lodash/values';
import mapValues from 'lodash/mapValues';
import groupBy from 'lodash/groupBy';
import toArray from 'lodash/toArray';
import some from 'lodash/some';
import { translate } from 'i18n-calypso';
import page from 'page';

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
	MEDIA_IMAGE_PHOTON,
	MEDIA_IMAGE_RESIZER,
	MEDIA_IMAGE_THUMBNAIL,
} from 'lib/media/constants';
import { getSiteSlug } from 'state/sites/selectors';
import MediaLibraryHeader from './header';
import MediaLibraryScaleHeader from './empty-header';
import MediaLibraryList from './list';
import { requestKeyringConnections } from 'state/sharing/keyring/actions';
import {
	isKeyringConnectionsFetching,
	getKeyringConnections,
} from 'state/sharing/keyring/selectors';

const isConnected = props => some( props.connectedServices, item => item.service === props.source );

const MediaLibraryContent = React.createClass( {
	propTypes: {
		site: React.PropTypes.object,
		mediaValidationErrors: React.PropTypes.object,
		filter: React.PropTypes.string,
		filterRequiresUpgrade: React.PropTypes.bool,
		search: React.PropTypes.string,
		source: React.PropTypes.string,
		containerWidth: React.PropTypes.number,
		single: React.PropTypes.bool,
		scrollable: React.PropTypes.bool,
		onAddMedia: React.PropTypes.func,
		onMediaScaleChange: React.PropTypes.func,
		onEditItem: React.PropTypes.func,
		postId: React.PropTypes.number
	},

	getDefaultProps: function() {
		return {
			mediaValidationErrors: Object.freeze( {} ),
			onAddMedia: noop,
			source: '',
		};
	},

	componentWillMount: function() {
		if ( ! this.props.isRequesting && this.props.source !== '' && this.props.connectedServices.length === 0 ) {
			// Are we connected to anything yet?
			this.props.requestKeyringConnections();
		}
	},

	renderErrors: function() {
		var errorTypes, notices;

		errorTypes = values( this.props.mediaValidationErrors ).map( head );
		notices = mapValues( groupBy( errorTypes ), ( occurrences, errorType ) => {
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

			switch ( errorType ) {
				case MediaValidationErrors.FILE_TYPE_NOT_IN_PLAN:
					status = 'is-warning';
					upgradeNudgeName = 'plan-media-storage-error-video';
					upgradeNudgeFeature = 'video-upload';
					message = this.translate(
						'%d file could not be uploaded because your site does not support video files. Upgrade to a premium plan for video support.',
						'%d files could not be uploaded because your site does not support video files. Upgrade to a premium plan for video support.',
						i18nOptions
					);
					break;
				case MediaValidationErrors.FILE_TYPE_UNSUPPORTED:
					message = this.translate(
						'%d file could not be uploaded because the file type is not supported.',
						'%d files could not be uploaded because their file types are unsupported.',
						i18nOptions
					);
					break;
				case MediaValidationErrors.UPLOAD_VIA_URL_404:
					message = this.translate(
						'%d file could not be uploaded because no image exists at the specified URL.',
						'%d files could not be uploaded because no images exist at the specified URLs',
						i18nOptions
					);
					break;
				case MediaValidationErrors.EXCEEDS_MAX_UPLOAD_SIZE:
					message = this.translate(
						'%d file could not be uploaded because it exceeds the maximum upload size.',
						'%d files could not be uploaded because they exceed the maximum upload size.',
						i18nOptions
					);
					break;
				case MediaValidationErrors.NOT_ENOUGH_SPACE:
					upgradeNudgeName = 'plan-media-storage-error';
					upgradeNudgeFeature = 'extra-storage';
					message = this.translate(
						'%d file could not be uploaded because there is not enough space left.',
						'%d files could not be uploaded because there is not enough space left.',
						i18nOptions
					);
					break;
				case MediaValidationErrors.EXCEEDS_PLAN_STORAGE_LIMIT:
					upgradeNudgeName = 'plan-media-storage-error';
					upgradeNudgeFeature = 'extra-storage';
					message = this.translate(
						'%d file could not be uploaded because you have reached your plan storage limit.',
						'%d files could not be uploaded because you have reached your plan storage limit.',
						i18nOptions
					);
					break;
				default:
					message = this.translate(
						'%d file could not be uploaded because an error occurred while uploading.',
						'%d files could not be uploaded because errors occurred while uploading.',
						i18nOptions
					);
					break;
			}

			return (
				<Notice status={ status } text={ message } onDismissClick={ onDismiss } >
					{ this.renderNoticeAction( upgradeNudgeName, upgradeNudgeFeature ) }
				</Notice>
			);
		} );

		return createFragment( notices );
	},

	renderNoticeAction( upgradeNudgeName, upgradeNudgeFeature ) {
		if ( !upgradeNudgeName ) {
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
				{ this.translate( 'Upgrade Plan' ) }
				<TrackComponentView eventName={ eventName } eventProperties={ eventProperties } />
			</NoticeAction>
		);
	},

	recordPlansNavigation( tracksEvent, tracksData ) {
		analytics.ga.recordEvent( 'Media', 'Clicked Upload Error Action' );
		analytics.tracks.recordEvent( tracksEvent, tracksData );
	},

	goToSharing( ev ) {
		ev.preventDefault();
		page( `/sharing/${ this.props.site.slug }` );
	},

	renderExternalMedia() {
		const connectMessage = translate(
			'To show Photos from Google, you need to connect your Google account. Do that from {{link}}your Sharing settings{{/link}}.', {
				components: {
					link: <a href={ `/sharing/${ this.props.site.slug }` } onClick={ this.goToSharing } />
				}
			}
		);

		return (
			<div className="media-library__connect-message">
				<p><img src="/calypso/images/sharing/google-photos-logo.svg" width="96" height="96" /></p>
				<p>{ connectMessage }</p>
			</div>
		);
	},

	getThumbnailType() {
		if ( this.props.source !== '' ) {
			return MEDIA_IMAGE_THUMBNAIL;
		}

		if ( this.props.site.is_private ) {
			return MEDIA_IMAGE_RESIZER;
		}

		return MEDIA_IMAGE_PHOTON;
	},

	renderMediaList: function() {
		if ( ! this.props.site || this.props.isRequesting ) {
			return <MediaLibraryList key="list-loading" filterRequiresUpgrade={ this.props.filterRequiresUpgrade } />;
		}

		if ( this.props.source !== '' && ! isConnected( this.props ) ) {
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
	},

	renderHeader() {
		if ( this.props.source !== '' ) {
			return (
				<MediaLibraryScaleHeader onMediaScaleChange={ this.props.onMediaScaleChange } />
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
	},

	render: function() {
		return (
			<div className="media-library__content">
				{ this.renderHeader() }
				{ this.renderErrors() }
				{ this.renderMediaList() }
			</div>
		);
	}
} );

export default connect( ( state, ownProps ) => {
	return {
		siteSlug: ownProps.site ? getSiteSlug( state, ownProps.site.ID ) : '',
		connectedServices: toArray( getKeyringConnections( state ) ).filter( item => item.type === 'other' && item.status === 'ok' ),
		isRequesting: isKeyringConnectionsFetching( state ),
	};
}, {
	requestKeyringConnections,
}, null, { pure: false } )( MediaLibraryContent );
