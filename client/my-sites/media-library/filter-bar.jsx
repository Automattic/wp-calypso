/**
 * External dependencies
 */
var React = require( 'react' ),
	includes = require( 'lodash/includes' ),
	noop = require( 'lodash/noop' );

/**
 * Internal dependencies
 */
var SectionNav = require( 'components/section-nav' ),
	SectionNavTabs = require( 'components/section-nav/tabs' ),
	SectionNavTabItem = require( 'components/section-nav/item' ),
	Search = require( 'components/search' );

module.exports = React.createClass( {
	displayName: 'MediaLibraryFilterBar',

	propTypes: {
		site: React.PropTypes.object,
		basePath: React.PropTypes.string,
		filter: React.PropTypes.string,
		filterRequiresUpgrade: React.PropTypes.bool,
		enabledFilters: React.PropTypes.arrayOf( React.PropTypes.string ),
		search: React.PropTypes.string,
		onFilterChange: React.PropTypes.func,
		onSearch: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			filter: '',
			basePath: '/media',
			onFilterChange: noop,
			onSearch: noop
		};
	},

	getSearchPlaceholderText: function() {
		var placeholderText;

		switch ( this.props.filter ) {
			case 'images':
				placeholderText = this.translate( 'Search images…', { textOnly: true } );
				break;
			case 'audio':
				placeholderText = this.translate( 'Search audio files…', { textOnly: true } );
				break;
			case 'videos':
				placeholderText = this.translate( 'Search videos…', { textOnly: true } );
				break;
			case 'documents':
				placeholderText = this.translate( 'Search documents…', { textOnly: true } );
				break;
			default:
				placeholderText = this.translate( 'Search all media…', { textOnly: true } );
				break;
		}

		return placeholderText;
	},

	getFilterLabel: function( filter ) {
		var label;

		switch ( filter ) {
			case 'images':
				label = this.translate( 'Images', { comment: 'Filter label for media list', textOnly: true } );
				break;
			case 'audio':
				label = this.translate( 'Audio', { comment: 'Filter label for media list', textOnly: true } );
				break;
			case 'videos':
				label = this.translate( 'Videos', { comment: 'Filter label for media list', textOnly: true } );
				break;
			case 'documents':
				label = this.translate( 'Documents', { comment: 'Filter label for media list', textOnly: true } );
				break;
			default:
				label = this.translate( 'All', { comment: 'Filter label for media list', textOnly: true } );
				break;
		}

		return label;
	},

	isFilterDisabled: function( filter ) {
		return this.props.enabledFilters && ( ! filter.length || ! includes( this.props.enabledFilters, filter ) );
	},

	renderTabItems: function() {
		const tabs = [ '', 'images', 'documents', 'videos', 'audio' ];

		return tabs.map( function( filter ) {
			return (
				<SectionNavTabItem
					key={ 'filter-tab-' + filter }
					selected={ this.props.filter === filter }
					onClick={ this.props.onFilterChange.bind( null, filter ) }
					disabled={ this.isFilterDisabled( filter ) }>
					{ this.getFilterLabel( filter ) }
				</SectionNavTabItem>
			);
		}, this );
	},

	render: function() {
		return (
			<SectionNav selectedText={ this.getFilterLabel( this.props.filter ) } hasSearch={ true }>
				<SectionNavTabs>
					{ this.renderTabItems() }
				</SectionNavTabs>
				{ ! this.props.filterRequiresUpgrade &&
					<Search
						analyticsGroup="Media"
						pinned
						fitsContainer
						onSearch={ this.props.onSearch }
						initialValue={ this.props.search }
						placeholder={ this.getSearchPlaceholderText() }
						delaySearch={ true } />
				}
			</SectionNav>
		);
	}
} );
