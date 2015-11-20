/**
 * External dependencies
 */
var React = require( 'react' ),
	noop = require( 'lodash/utility/noop' );

/**
 * Internal dependencies
 */
var Popover = require( 'components/popover' ),
	sitesList = require( 'lib/sites-list' )(),
	hasTouch = require( 'lib/touch-detect' ).hasTouch,
	SiteSelector = require( 'components/site-selector' );

module.exports = React.createClass( {
	displayName: 'SitesPopover',

	propTypes: {
		context: React.PropTypes.object,
		visible: React.PropTypes.bool,
		onClose: React.PropTypes.func,
		position: React.PropTypes.string
	},

	getInitialState: function() {
		return {
			popoverVisible: false
		};
	},

	getDefaultProps: function() {
		return {
			visible: false,
			onClose: noop,
			position: 'bottom left'
		};
	},

	componentDidMount: function() {
		this.updatePopoverVisibilityState();
	},

	componentDidUpdate: function( prevProps ) {
		if ( this.props.visible !== prevProps.visible ) {
			this.updatePopoverVisibilityState();
		}
	},

	updatePopoverVisibilityState: function() {
		this.setState( {
			popoverVisible: this.props.visible
		} );
	},

	render: function() {
		return (
			<Popover
				isVisible={ this.props.visible }
				context={ this.props.context }
				onClose={ this.props.onClose }
				position={ this.props.position }
				className="popover sites-popover">
				{ this.state.popoverVisible ?
					<SiteSelector
						sites={ sitesList }
						siteBasePath="/post"
						showAddNewSite={ false }
						indicator={ false }
						autoFocus={ ! hasTouch() }
						onClose={ this.props.onClose } /> : null }
			</Popover>
		);
	}
} );
