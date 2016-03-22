
// External dependencies
var React = require( 'react' );

// Internal dependencies
var siteStatsStickyTabStore = require( 'lib/site-stats-sticky-tab/store' );
var sections = require( 'sections-preload' );

var SiteStatsStickyLink = React.createClass( {

	propTypes: {
		title: React.PropTypes.string,
		onClick: React.PropTypes.func
	},

	_preloaded: false,

	getInitialState: function() {
		return {
			url: siteStatsStickyTabStore.getUrl()
		};
	},

	componentDidMount: function() {
		siteStatsStickyTabStore.on( 'change', this.handleStatsStickyTabChange );
	},

	componentWillUnmount: function() {
		siteStatsStickyTabStore.off( 'change', this.handleStatsStickyTabChange );
	},

	handleStatsStickyTabChange: function() {
		var url = siteStatsStickyTabStore.getUrl();

		if ( url !== this.state.url ) {
			this.setState( {
				url: url
			} );
		}
	},

	preload: function() {
		if ( ! this._preloaded ) {
			this._preloaded = true;
			sections.preload( 'stats' );
		}
	},

	render: function() {
		return (
			<a
				href={ this.state.url }
				onClick={ this.props.onClick }
				title={ this.props.title }
				onMouseEnter={ this.preload }
			>
				{ this.props.children }
			</a>
		);
	}
} );

module.exports = SiteStatsStickyLink;
