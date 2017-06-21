/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	isEqual = require( 'lodash/isEqual' );

/**
 * Internal dependencies
 */
var Content = require( './content' ),
	MediaActions = require( 'lib/media/actions' ),
	MediaLibraryDropZone = require( './drop-zone' ),
	MediaLibrarySelectedStore = require( 'lib/media/library-selected-store' ),
	MediaUtils = require( 'lib/media/utils' ),
	filterToMimePrefix = require( './filter-to-mime-prefix' ),
	FilterBar = require( './filter-bar' ).default,
	MediaValidationData = require( 'components/data/media-validation-data' ),
	urlSearch = require( 'lib/mixins/url-search' );
import QueryPreferences from 'components/data/query-preferences';

module.exports = React.createClass( {
	displayName: 'MediaLibrary',

	mixins: [ urlSearch ],

	propTypes: {
		className: React.PropTypes.string,
		site: React.PropTypes.object,
		filter: React.PropTypes.string,
		enabledFilters: React.PropTypes.arrayOf( React.PropTypes.string ),
		search: React.PropTypes.string,
		source: React.PropTypes.string,
		onAddMedia: React.PropTypes.func,
		onFilterChange: React.PropTypes.func,
		onSearch: React.PropTypes.func,
		onScaleChange: React.PropTypes.func,
		onEditItem: React.PropTypes.func,
		fullScreenDropZone: React.PropTypes.bool,
		containerWidth: React.PropTypes.number,
		single: React.PropTypes.bool,
		scrollable: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			fullScreenDropZone: true,
			onAddMedia: () => {},
			onScaleChange: () => {},
			scrollable: false,
		};
	},

	componentDidMount: function() {
		this.onSearch = this.props.onSearch;
	},

	componentDidUpdate: function() {
		this.onSearch = this.props.onSearch;
	},

	componentWillUnmount: function() {
		delete this.onSearch;
	},

	onAddMedia: function() {
		let selectedItems = MediaLibrarySelectedStore.getAll( this.props.site.ID ),
			filteredItems = selectedItems;

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
	},

	filterRequiresUpgrade: function() {
		const { filter, site } = this.props;
		switch ( filter ) {
			case 'audio':
				return ! ( site && site.options.upgraded_filetypes_enabled || site.jetpack );

			case 'videos':
				return ! ( site && site.options.videopress_enabled || site.jetpack );
		}

		return false;
	},

	renderDropZone: function() {
		return (
			<MediaLibraryDropZone
				site={ this.props.site }
				filter={ this.props.filter }
				fullScreen={ this.props.fullScreenDropZone }
				onAddMedia={ this.onAddMedia } />
		);
	},

	render: function() {
		var classes, content;

		content = (
			<Content
				site={ this.props.site }
				filter={ this.props.filter }
				filterRequiresUpgrade={ this.filterRequiresUpgrade() }
				search={ this.props.search }
				source={ this.props.source }
				containerWidth={ this.props.containerWidth }
				single={ this.props.single }
				scrollable={ this.props.scrollable }
				onAddMedia={ this.onAddMedia }
				onAddAndEditImage={ this.props.onAddAndEditImage }
				onMediaScaleChange={ this.props.onScaleChange }
				selectedItems={ this.props.mediaLibrarySelectedItems }
				onDeleteItem={ this.props.onDeleteItem }
				onEditItem={ this.props.onEditItem }
				onViewDetails={ this.props.onViewDetails } />
		);

		if ( this.props.site ) {
			content = (
				<MediaValidationData siteId={ this.props.site.ID }>
					{ content }
				</MediaValidationData>
			);
		}

		classes = classNames(
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
					source={ this.props.source }
					onSourceChange={ this.props.onSourceChange }
					onSearch={ this.doSearch } />
				{ content }
			</div>
		);
	}
} );
