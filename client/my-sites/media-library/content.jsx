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
import { ValidationErrors as MediaValidationErrors } from 'lib/media/constants';
import { getSiteSlug } from 'state/sites/selectors';
import MediaLibraryHeader from './header';
import MediaLibraryList from './list';

const MediaLibraryContent = React.createClass( {
	propTypes: {
		site: React.PropTypes.object,
		mediaValidationErrors: React.PropTypes.object,
		filter: React.PropTypes.string,
		filterRequiresUpgrade: React.PropTypes.bool,
		search: React.PropTypes.string,
		containerWidth: React.PropTypes.number,
		single: React.PropTypes.bool,
		scrollable: React.PropTypes.bool,
		onAddMedia: React.PropTypes.func,
		onMediaScaleChange: React.PropTypes.func,
		onEditItem: React.PropTypes.func,
	},

	getDefaultProps: function() {
		return {
			mediaValidationErrors: Object.freeze( {} ),
			onAddMedia: noop
		};
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

	renderMediaList: function() {
		if ( ! this.props.site ) {
			return <MediaLibraryList key="list-loading" />;
		}

		return (
			<MediaListData siteId={ this.props.site.ID } filter={ this.props.filter } search={ this.props.search }>
				<MediaLibrarySelectedData siteId={ this.props.site.ID }>
					<MediaLibraryList
						key={ 'list-' + ( [ this.props.site.ID, this.props.search, this.props.filter ].join() ) }
						site={ this.props.site }
						filter={ this.props.filter }
						filterRequiresUpgrade={ this.props.filterRequiresUpgrade }
						search={ this.props.search }
						containerWidth={ this.props.containerWidth }
						photon={ ! this.props.site.is_private }
						single={ this.props.single }
						scrollable={ this.props.scrollable }
						onEditItem={ this.props.onEditItem } />
				</MediaLibrarySelectedData>
			</MediaListData>
		);
	},

	render: function() {
		return (
			<div className="media-library__content">
				{ ! this.props.filterRequiresUpgrade &&
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
				}
				{ this.renderErrors() }
				{ this.renderMediaList() }
			</div>
		);
	}
} );

export default connect( ( state, ownProps ) => {
	return {
		siteSlug: ownProps.site ? getSiteSlug( state, ownProps.site.ID ) : ''
	};
}, null, null, { pure: false } )( MediaLibraryContent );
