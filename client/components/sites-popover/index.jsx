/**
 * External dependencies
 */
var React = require( 'react' ),
	noop = require( 'lodash/noop' ),
	classnames = require( 'classnames' );

/**
 * Internal dependencies
 */
var Popover = require( 'components/popover' ),
	hasTouch = require( 'lib/touch-detect' ).hasTouch,
	SiteSelector = require( 'components/site-selector' );

module.exports = React.createClass( {
	displayName: 'SitesPopover',

	propTypes: {
		sites: React.PropTypes.object,
		context: React.PropTypes.object,
		visible: React.PropTypes.bool,
		onClose: React.PropTypes.func,
		position: React.PropTypes.string,
		groups: React.PropTypes.bool,
		className: React.PropTypes.string
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
			position: 'bottom left',
			groups: false,
			siteQuerystring: false,
			className: ''
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
		let classes = classnames(
			this.props.className,
			'popover sites-popover',
			this.props.header && 'has-header' );

		return (
			<Popover
				isVisible={ this.props.visible }
				context={ this.props.context }
				onClose={ this.props.onClose }
				position={ this.props.position }
				className={ classes }>
				{ this.state.popoverVisible && this.props.header
					? <div className="sites-popover__header">
							{ this.props.header }
						</div>
					: null
				}
				{ this.state.popoverVisible
					? <SiteSelector
							sites={ this.props.sites }
							siteBasePath="/post"
							onSiteSelect={ this.props.onSiteSelect }
							showAddNewSite={ false }
							indicator={ false }
							autoFocus={ ! hasTouch() }
							groups={ true }
							onClose={ this.props.onClose } />
					: null
				}
			</Popover>
		);
	}
} );
