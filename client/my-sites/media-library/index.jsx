/**
 * External dependencies
 */
import classNames from 'classnames';
import { isEqual, toArray, some } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Content from './content';
import MediaLibraryDropZone from './drop-zone';
import FilterBar from './filter-bar';
import filterToMimePrefix from './filter-to-mime-prefix';
import MediaValidationData from 'components/data/media-validation-data';
import QueryPreferences from 'components/data/query-preferences';
import MediaActions from 'lib/media/actions';
import MediaLibrarySelectedStore from 'lib/media/library-selected-store';
import MediaUtils from 'lib/media/utils';
import searchUrl from 'lib/search-url';
import { requestKeyringConnections } from 'state/sharing/keyring/actions';
import { isKeyringConnectionsFetching, getKeyringConnections } from 'state/sharing/keyring/selectors';

const isConnected = props => props.source === '' || some( props.connectedServices, item => item.service === props.source );
const needsKeyring = props => ! props.isRequesting && props.source !== '' && props.connectedServices.length === 0;

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
	};

	static defaultProps = {
		fullScreenDropZone: true,
		onAddMedia: () => {},
		onScaleChange: () => {},
		scrollable: false,
		source: '',
	};

	componentWillMount() {
		if ( needsKeyring( this.props ) ) {
			// Are we connected to anything yet?
			this.props.requestKeyringConnections();
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( needsKeyring( nextProps ) && this.props.source === '' ) {
			// If we have changed to an external data source then check for a keyring connection
			this.props.requestKeyringConnections();
		}
	}

	doSearch = keywords => {
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
			filteredItems = MediaUtils.filterItemsByMimePrefix(
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
	}

	filterRequiresUpgrade() {
		const { filter, site, source } = this.props;
		if ( source ) {
			return false;
		}

		switch ( filter ) {
			case 'audio':
				return ! ( site && site.options.upgraded_filetypes_enabled || site.jetpack );

			case 'videos':
				return ! ( site && site.options.videopress_enabled || site.jetpack );
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
				onAddMedia={ this.onAddMedia } />
		);
	}

	render() {
		let content;

		content = (
			<Content
				site={ this.props.site }
				filter={ this.props.filter }
				filterRequiresUpgrade={ this.filterRequiresUpgrade() }
				search={ this.props.search }
				source={ this.props.source }
				isConnected={ isConnected( this.props ) }
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
				postId={ this.props.postId } />
		);

		if ( this.props.site ) {
			content = (
				<MediaValidationData siteId={ this.props.site.ID }>
					{ content }
				</MediaValidationData>
			);
		}

		const classes = classNames(
			'media-library',
			{ 'is-single': this.props.single },
			this.props.className,
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
					isConnected={ isConnected( this.props ) }
					post={ !! this.props.postId } />
				{ content }
			</div>
		);
	}
}

export default connect( state => ( {
	connectedServices: toArray( getKeyringConnections( state ) ).filter( item => item.type === 'other' && item.status === 'ok' ),
	isRequesting: isKeyringConnectionsFetching( state ),
} ), {
	requestKeyringConnections,
} )( MediaLibrary );
