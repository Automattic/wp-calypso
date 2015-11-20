
// External dependencies
var React = require( 'react' );

// Internal dependencies
var siteStatsStickyTabStore = require( 'lib/site-stats-sticky-tab/store' );

var SiteStatsStickyLink = React.createClass( {

	propTypes: {
		title: React.PropTypes.string,
		onClick: React.PropTypes.func
	},

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

	shouldComponentUpdate: function( nextProps, nextState ) {
		if (
			nextState.url !== this.state.url ||
			nextProps.onClick !== this.props.onClick ||
			nextProps.title !== this.props.title
		) {
			return true;
		}

		return false;
	},

	handleStatsStickyTabChange: function() {
		var url = siteStatsStickyTabStore.getUrl();

		if ( url !== this.state.url ) {
			this.setState( {
				url: url
			} );
		}
	},

	render: function() {
		return (
			<a href={ this.state.url } onClick={ this.props.onClick } title={ this.props.title }>{
				this.props.children
			}</a>
		);
	}
} );

module.exports = SiteStatsStickyLink;
