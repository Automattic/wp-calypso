/**
 * External dependencies
 */
var React = require( 'react' ),
	createFragment = require( 'react-addons-create-fragment' ),
	noop = require( 'lodash/noop' ),
	head = require( 'lodash/head' ),
	values = require( 'lodash/values' ),
	mapValues = require( 'lodash/mapValues' ),
	groupBy = require( 'lodash/groupBy' ),
	debounce = require( 'lodash/debounce' ),
	debug = require( 'debug' )( 'calypso:media-library:content' );

/**
 * Internal dependencies
 */
var Notice = require( 'components/notice' ),
	MediaListData = require( 'components/data/media-list-data' ),
	MediaLibrarySelectedData = require( 'components/data/media-library-selected-data' ),
	MediaActions = require( 'lib/media/actions' ),
	MediaValidationErrors = require( 'lib/media/constants' ).ValidationErrors,
	PreferencesActions = require( 'lib/preferences/actions' ),
	isMobile = require( 'lib/viewport' ).isMobile,
	MediaLibraryHeader = require( './header' ),
	MediaLibraryList = require( './list' );

module.exports = React.createClass( {
	displayName: 'MediaLibraryContent',

	propTypes: {
		site: React.PropTypes.object,
		preferences: React.PropTypes.object,
		mediaValidationErrors: React.PropTypes.object,
		filter: React.PropTypes.string,
		search: React.PropTypes.string,
		containerWidth: React.PropTypes.number,
		single: React.PropTypes.bool,
		scrollable: React.PropTypes.bool,
		mediaScaleChoices: React.PropTypes.arrayOf( React.PropTypes.number ),
		initialMediaScale: React.PropTypes.number,
		onAddMedia: React.PropTypes.func,
		onMediaScaleChange: React.PropTypes.func,
		onEditItem: React.PropTypes.func
	},

	getInitialState: function() {
		return {};
	},

	getDefaultProps: function() {
		// To ensure some horizontal padding between items in the same row,
		// each of these values is slightly less than the corresponding
		// number of items per row.
		var scaleChoices = [
			1 / 12 - 0.006,
			1 /  8 - 0.01,
			1 /  6 - 0.01,
			1 /  4 - 0.01,
			1 /  3 - 0.01
		].map( function( scale ) {
			return Math.round( 1000 * scale ) / 1000;
		} );

		return {
			preferences: Object.freeze( {} ),
			mediaValidationErrors: Object.freeze( {} ),
			onAddMedia: noop,
			onMediaScaleChange: noop,
			mediaScaleChoices: scaleChoices,
			initialMediaScale: scaleChoices[2]
		};
	},

	getMediaScale: function() {
		var scale = this.props.initialMediaScale;

		if ( this.props.preferences && this.props.preferences.mediaScale ) {
			scale = this.props.preferences.mediaScale;
		}

		if ( this.state.mediaScale ) {
			scale = this.state.mediaScale;
		}

		if ( isMobile() && 1 !== scale ) {
			scale = MediaLibraryHeader.SCALE_TOUCH_GRID;
		}

		return scale;
	},

	setMediaScalePreference: debounce( function( value ) {
		PreferencesActions.set( 'mediaScale', value );
	}, 1000 ),

	onMediaScaleChange: function( scale ) {
		debug( 'onMediaScaleChange scale=%f', scale );
		this.setMediaScalePreference( scale );
		this.setState( {
			mediaScale: scale
		} );
		this.props.onMediaScaleChange( scale );
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

			switch ( errorType ) {
				case MediaValidationErrors.FILE_TYPE_UNSUPPORTED:
					message = this.translate(
						'The file could not be uploaded because the file type is not supported.',
						'%d files could not be uploaded because their file types are unsupported.',
						i18nOptions
					);
					break;
				case MediaValidationErrors.UPLOAD_VIA_URL_404:
					message = this.translate(
						'The file could not be uploaded because no image exists at the specified URL.',
						'%d files could not be uploaded because no images exist at the specified URLs',
						i18nOptions
					);
					break;
				case MediaValidationErrors.EXCEEDS_MAX_UPLOAD_SIZE:
					message = this.translate(
						'The file could not be uploaded because it exceeds the maximum upload size.',
						'%d files could not be uploaded because they exceed the maximum upload size.',
						i18nOptions
					);
					break;
				default:
					message = this.translate(
						'The file could not be uploaded because an error occurred while uploading.',
						'%d files could not be uploaded because errors occurred while uploading.',
						i18nOptions
					);
					break;
			}

			if ( this.props.site ) {
				onDismiss = MediaActions.clearValidationErrorsByType.bind( null, this.props.site.ID, errorType );
			}

			return (
				<Notice status="is-error" onDismissClick={ onDismiss }>
					{ message }
				</Notice>
			);
		} );

		return createFragment( notices );
	},

	renderMediaList: function() {
		if ( ! this.props.site ) {
			return <MediaLibraryList key="list-loading" mediaScale={ this.getMediaScale() } />;
		}

		return (
			<MediaListData siteId={ this.props.site.ID } filter={ this.props.filter } search={ this.props.search }>
				<MediaLibrarySelectedData siteId={ this.props.site.ID }>
					<MediaLibraryList
						key={ 'list-' + ( [ this.props.site.ID, this.props.search, this.props.filter ].join() ) }
						site={ this.props.site }
						filter={ this.props.filter }
						search={ this.props.search }
						containerWidth={ this.props.containerWidth }
						mediaScale={ this.getMediaScale() }
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
				<MediaLibraryHeader
					site={ this.props.site }
					filter={ this.props.filter }
					mediaScale={ this.getMediaScale() }
					mediaScaleChoices={ this.props.mediaScaleChoices }
					onMediaScaleChange={ this.onMediaScaleChange }
					onAddMedia={ this.props.onAddMedia } />
				{ this.renderErrors() }
				{ this.renderMediaList() }
			</div>
		);
	}
} );
