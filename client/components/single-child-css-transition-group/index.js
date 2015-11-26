var React = require( 'react' );

var ReactTransitionGroup = React.createFactory(
	require( 'react/lib/ReactTransitionGroup' )
);
var Child = React.createFactory(
	require( './child' )
);

var SingleChildCSSTransitionGroup = React.createClass( {
	displayName: 'SingleChildCSSTransitionGroup',

	propTypes: {
		transitionName: React.PropTypes.string.isRequired,
		onChildDidLeave: React.PropTypes.func,
		transitionEnter: React.PropTypes.bool,
		transitionLeave: React.PropTypes.bool,
		enterTimeout: React.PropTypes.number,
		leaveTimeout: React.PropTypes.number
	},

	getDefaultProps: function() {
		return {
			transitionEnter: true,
			transitionLeave: true
		};
	},

	_wrapChild: function( child ) {
		// We need to provide this childFactory so that
		// we can receive updates to name, enter, and
		// leave while it is leaving.
		return Child( // eslint-disable-line
			{
				name: this.props.transitionName,
				enter: this.props.transitionEnter,
				leave: this.props.transitionLeave,
				enterTimeout: this.props.enterTimeout,
				leaveTimeout: this.props.leaveTimeout,
				onComponentDidLeave: this.props.onChildDidLeave
			},
			child
		);
	},

	render: function() {
		return ReactTransitionGroup( // eslint-disable-line
			Object.assign( {}, this.props, {
				childFactory: this._wrapChild
			} )
		);
	}
} );

module.exports = SingleChildCSSTransitionGroup;
