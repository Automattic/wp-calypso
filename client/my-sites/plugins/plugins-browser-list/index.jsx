/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var PluginBrowserItem = require( 'my-sites/plugins/plugins-browser-item' ),
	Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {

	displayName: 'PluginsBrowserList',

	_DEFAULT_PLACEHOLDER_NUMBER: 6,

	getPluginsViewList: function() {
		var pluginsViewsList,
			emptyCounter = 0;

		pluginsViewsList = this.props.plugins.map( function( plugin, n ) {
			return <PluginBrowserItem site={ this.props.site } key={ plugin.slug + n } plugin={ plugin } currentSites={ this.props.currentSites } />;
		}, this );

		if ( this.props.showPlaceholders ) {
			pluginsViewsList = pluginsViewsList.concat( this.getPlaceholdersViews() );
		}

		// We need to complete the list with empty elements to keep the grid drawn.
		while ( pluginsViewsList.length % 3 !== 0 || pluginsViewsList.length % 2 !== 0 ) {
			pluginsViewsList.push( <div className="plugins-browser-item is-empty" key={ 'empty-item-' + emptyCounter++ }></div> );
		}

		if ( this.props.size ) {
			return pluginsViewsList.slice( 0, this.props.size );
		}

		return pluginsViewsList;
	},

	getPlaceholdersViews: function() {
		return Array.apply( null, Array( this.props.size || this._DEFAULT_PLACEHOLDER_NUMBER ) ).map( function( item, i ) {
			return <PluginBrowserItem isPlaceholder key={ 'placeholder-plugin-' + i } />;
		} );
	},

	getViews: function() {
		if ( this.props.plugins.length ) {
			return this.getPluginsViewList();
		} else if ( this.props.showPlaceholders ) {
			return this.getPlaceholdersViews();
		}
	},

	getLink: function() {
		if ( this.props.expandedListLink ) {
			return <a className="button is-link plugins-browser-list__select-all" href={ this.props.expandedListLink + ( this.props.site || '' ) }>
				{ this.translate( 'See All' ) }
				<Gridicon icon="chevron-right" size={ 12 } />
			</a>;
		}
	},

	render: function() {
		return (
			<div className="plugins-browser-list">
				<div className="plugins-browser-list__header">
					<h2 className="plugins-browser-list__title">
						{ this.props.title }
					</h2>
					{ this.getLink() }
				</div>
				<div className="plugins-browser-list__elements">
					{ this.getViews() }
				</div>
			</div>
		);
	}
} );
