/**
 * External dependencies
 */
var React = require( 'react' ),
	page = require( 'page' );

/**
 * Internal dependencies
 */
var MediaLibrary = require( 'my-sites/media-library' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	observe = require( 'lib/mixins/data-observe' );

module.exports = React.createClass( {
	displayName: 'Media',

	mixins: [ observe( 'sites' ) ],

	propTypes: {
		sites: React.PropTypes.object
	},

	getInitialState: function() {
		return {};
	},

	componentDidMount: function() {
		this.setState( {
			containerWidth: this.refs.container.getDOMNode().clientWidth
		} );
	},

	onFilterChange: function( filter ) {
		var redirect = '/media';

		if ( filter ) {
			redirect += '/' + filter;
		}

		if ( this.props.sites.selected ) {
			redirect += '/' + this.props.sites.selected;
		}

		page( redirect );
	},

	render: function() {
		return (
			<div ref="container" className="main main-column media" role="main">
				<SidebarNavigation />
				<MediaLibrary
					{ ...this.props }
					onFilterChange={ this.onFilterChange }
					site={ this.props.sites.getSelectedSite() || undefined }
					containerWidth={ this.state.containerWidth } />
			</div>
		);
	}
} );
