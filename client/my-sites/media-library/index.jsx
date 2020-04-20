/**
 * External dependencies
 */

import React, { Component } from 'react';
import classNames from 'classnames';
import { includes, isEqual, some } from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Content from './content';
import getMediaErrors from 'state/selectors/get-media-errors';
import MediaActions from 'lib/media/actions';
import MediaLibraryDropZone from './drop-zone';
import MediaLibrarySelectedStore from 'lib/media/library-selected-store';
import { filterItemsByMimePrefix } from 'lib/media/utils';
import filterToMimePrefix from './filter-to-mime-prefix';
import FilterBar from './filter-bar';
import QueryPreferences from 'components/data/query-preferences';
import searchUrl from 'lib/search-url';
import {
	isKeyringConnectionsFetching,
	getKeyringConnections,
} from 'state/sharing/keyring/selectors';
import { requestKeyringConnections } from 'state/sharing/keyring/actions';

/**
 * Style dependencies
 */
import './style.scss';

// External media sources that do not need a user to connect them should be listed here.
const noConnectionNeeded = [ 'pexels' ];

const sourceNeedsKeyring = ( source ) => source !== '' && ! includes( noConnectionNeeded, source );

const isConnected = ( state, source ) =>
	! sourceNeedsKeyring( source ) ||
	some( getKeyringConnections( state ), { type: 'other', status: 'ok', service: source } );

const needsKeyring = ( state, source ) =>
	sourceNeedsKeyring( source ) &&
	! isKeyringConnectionsFetching( state ) &&
	! some( getKeyringConnections( state ), { type: 'other', status: 'ok' } );

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
		onEditItem: PropTypes.func,
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
		const selectedItems = MediaLibrarySelectedStore.getAll( this.props.site.ID );
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
			MediaActions.setLibrarySelectedItems( this.props.site.ID, filteredItems );
		}

		this.props.onAddMedia();
	};

	filterRequiresUpgrade() {
		const { filter, site, source } = this.props;
		if ( source ) {
			return false;
		}

		switch ( filter ) {
			case 'audio':
				return ! ( ( site && site.options.upgraded_filetypes_enabled ) || site.jetpack );

			case 'videos':
				return ! ( ( site && site.options.videopress_enabled ) || site.jetpack );
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
		const classes = classNames(
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
					selectedItems={ this.props.mediaLibrarySelectedItems }
					onDeleteItem={ this.props.onDeleteItem }
					onEditItem={ this.props.onEditItem }
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
	} ),
	{
		requestKeyringConnections,
	}
)( MediaLibrary );
