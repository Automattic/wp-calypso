import clsx from 'clsx';
import { includes, isEqual, some } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryPreferences from 'calypso/components/data/query-preferences';
import { filterItemsByMimePrefix } from 'calypso/lib/media/utils';
import searchUrl from 'calypso/lib/search-url';
import { selectMediaItems, requestPhotosPickerFeatureStatus } from 'calypso/state/media/actions';
import getGooglePhotosPickerFeatureStatus from 'calypso/state/selectors/get-google-photos-picker-feature-status';
import getMediaErrors from 'calypso/state/selectors/get-media-errors';
import getMediaLibrarySelectedItems from 'calypso/state/selectors/get-media-library-selected-items';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { requestKeyringConnections } from 'calypso/state/sharing/keyring/actions';
import {
	isKeyringConnectionsFetching,
	getKeyringConnections,
} from 'calypso/state/sharing/keyring/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import Content from './content';
import MediaLibraryDropZone from './drop-zone';
import FilterBar from './filter-bar';
import filterToMimePrefix from './filter-to-mime-prefix';

import './style.scss';

// External media sources that do not need a user to connect them should be listed here.
const noConnectionNeeded = [ 'openverse', 'pexels' ];

const sourceNeedsKeyring = ( source ) => source !== '' && ! includes( noConnectionNeeded, source );

const isConnected = ( state, source ) =>
	! sourceNeedsKeyring( source ) ||
	some( getKeyringConnections( state ), { type: 'other', status: 'ok', service: source } );

const needsKeyring = ( state, source ) => {
	return (
		sourceNeedsKeyring( source ) &&
		! isKeyringConnectionsFetching( state ) &&
		( ! some( getKeyringConnections( state ), { type: 'other', status: 'ok' } ) ||
			! some( getKeyringConnections( state ), { type: 'other', status: 'invalid' } ) )
	);
};

class MediaLibrary extends Component {
	static propTypes = {
		className: PropTypes.string,
		site: PropTypes.object,
		filter: PropTypes.string,
		enabledFilters: PropTypes.arrayOf( PropTypes.string ),
		search: PropTypes.string,
		source: PropTypes.string,
		onAddMedia: PropTypes.func,
		onFilterChange: PropTypes.func,
		onSourceChange: PropTypes.func,
		onSearch: PropTypes.func,
		onScaleChange: PropTypes.func,
		fullScreenDropZone: PropTypes.bool,
		containerWidth: PropTypes.number,
		single: PropTypes.bool,
		scrollable: PropTypes.bool,
		postId: PropTypes.number,
		disableLargeImageSources: PropTypes.bool,
		disabledDataSources: PropTypes.arrayOf( PropTypes.string ),
	};

	static defaultProps = {
		fullScreenDropZone: true,
		onAddMedia: () => {},
		onScaleChange: () => {},
		scrollable: false,
		source: '',
		disableLargeImageSources: false,
		disabledDataSources: [],
	};

	componentDidMount() {
		if ( this.props.needsKeyring ) {
			// Are we connected to anything yet?
			this.props.requestKeyringConnections();
		}

		if ( this.props.photosPickerApiEnabled === null ) {
			this.props.requestPhotosPickerFeatureStatus();
		}
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.needsKeyring && ! sourceNeedsKeyring( prevProps.source ) ) {
			// If we have changed to an external data source then check for a keyring connection
			this.props.requestKeyringConnections();
		}
	}

	doSearch = ( keywords ) => {
		searchUrl( keywords, this.props.search, this.props.onSearch );
	};

	onAddMedia = () => {
		const { selectedItems } = this.props;
		let filteredItems = selectedItems;

		if ( ! this.props.site ) {
			return;
		}

		if ( this.props.filter ) {
			// Ensure that items selected as a consequence of this upload match
			// the current filter
			filteredItems = filterItemsByMimePrefix(
				filteredItems,
				filterToMimePrefix( this.props.filter )
			);
		}

		if ( this.props.single && filteredItems.length > 1 ) {
			// If items were previously selected or multiple files were
			// uploaded, select only the last item
			filteredItems = filteredItems.slice( -1 );
		}

		if ( ! isEqual( selectedItems, filteredItems ) ) {
			this.props.selectMediaItems( this.props.site.ID, filteredItems );
		}

		this.props.onAddMedia();
	};

	filterRequiresUpgrade() {
		const { filter, site, source, isJetpack, hasVideoUploadFeature } = this.props;
		if ( source ) {
			return false;
		}

		switch ( filter ) {
			case 'audio':
				return ! ( site?.options?.upgraded_filetypes_enabled || isJetpack );

			case 'videos':
				return ! hasVideoUploadFeature;
		}

		return false;
	}

	renderDropZone() {
		if ( this.props.source !== '' ) {
			return null;
		}

		return (
			<MediaLibraryDropZone
				site={ this.props.site }
				filter={ this.props.filter }
				fullScreen={ this.props.fullScreenDropZone }
				onAddMedia={ this.onAddMedia }
			/>
		);
	}

	render() {
		const classes = clsx(
			'media-library',
			{ 'is-single': this.props.single },
			this.props.className
		);

		return (
			<div className={ classes }>
				<QueryPreferences />
				{ this.renderDropZone() }
				<FilterBar
					site={ this.props.site }
					filter={ this.props.filter }
					filterRequiresUpgrade={ this.filterRequiresUpgrade() }
					enabledFilters={ this.props.enabledFilters }
					search={ this.props.search }
					onFilterChange={ this.props.onFilterChange }
					onSourceChange={ this.props.onSourceChange }
					source={ this.props.source }
					onSearch={ this.doSearch }
					isConnected={ this.props.isConnected }
					post={ !! this.props.postId }
					disableLargeImageSources={ this.props.disableLargeImageSources }
					disabledDataSources={ this.props.disabledDataSources }
					photosPickerApiEnabled={ this.props.photosPickerApiEnabled }
				/>
				<Content
					site={ this.props.site }
					filter={ this.props.filter }
					filterRequiresUpgrade={ this.filterRequiresUpgrade() }
					search={ this.props.search }
					source={ this.props.source }
					isConnected={ this.props.isConnected }
					containerWidth={ this.props.containerWidth }
					single={ this.props.single }
					scrollable={ this.props.scrollable }
					onAddMedia={ this.onAddMedia }
					onAddAndEditImage={ this.props.onAddAndEditImage }
					onMediaScaleChange={ this.props.onScaleChange }
					onSourceChange={ this.props.onSourceChange }
					onDeleteItem={ this.props.onDeleteItem }
					onViewDetails={ this.props.onViewDetails }
					postId={ this.props.postId }
					mediaValidationErrors={ this.props.site ? this.props.mediaValidationErrors : undefined }
				/>
			</div>
		);
	}
}

export default connect(
	( state, { source = '', site } ) => ( {
		isConnected: isConnected( state, source ),
		mediaValidationErrors: getMediaErrors( state, site?.ID ),
		needsKeyring: needsKeyring( state, source ),
		selectedItems: getMediaLibrarySelectedItems( state, site?.ID ),
		isJetpack: isJetpackSite( state, site?.ID ),
		hasVideoUploadFeature: siteHasFeature( state, site?.ID, 'upload-video-files' ),
		photosPickerApiEnabled: getGooglePhotosPickerFeatureStatus( state ),
	} ),
	{
		requestKeyringConnections,
		requestPhotosPickerFeatureStatus,
		selectMediaItems,
	}
)( MediaLibrary );
