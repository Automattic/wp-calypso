/**
 * External Dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' ),
	noop = require( 'lodash/utility/noop' ),
	classnames = require( 'classnames' );

/**
 * Internal dependencies
 */
var titleActions = require( 'lib/screen-title/actions' ),
	Gridicon = require( 'components/gridicon' ),
	viewport = require( 'lib/viewport' );

var UpdateNotice = React.createClass( {
	mixins: [ PureRenderMixin ],

	propTypes: {
		count: React.PropTypes.number.isRequired,
		onClick: React.PropTypes.func
	},

	getDefaultProps: function() {
		return { onClick: noop };
	},

	getInitialState: function() {
		return {
			isAtTop: false
		}
	},

	componentDidMount: function() {
		this.setCount();
		this.threshold = React.findDOMNode( this ).offsetTop;
		window.addEventListener( 'scroll', this.onWindowScroll );
	},

	componentWillUnmount: function() {
		window.removeEventListener( 'scroll', this.onWindowScroll );
	},

	componentDidUpdate: function() {
		this.setCount();
	},

	setCount: function() {
		titleActions.setCount( this.props.count ? this.countString() : false );
	},

	countString: function() {
		return this.props.count >= 40 ? '40+' : ( '' + this.props.count );
	},

	onWindowScroll: function() {
		if ( viewport.isMobile() ) {
			return this.setState( { isAtTop: window.pageYOffset > this.threshold } );
		}
	},

	render: function() {
		var counterClasses = classnames( {
			'reader-update-notice': true,
			'is-active': this.props.count > 0,
			'is-at-top': this.state.isAtTop
		} );

		return (
			<div className={ counterClasses } onTouchTap={ this.handleClick } >
				<Gridicon icon="arrow-up" size={ 18 } />
				{ this.translate( '%s new post', '%s new posts', { args: [ this.countString() ], count: this.props.count } ) }
			</div>
		);
	},

	handleClick: function( event ) {
		event.preventDefault();
		this.props.onClick();
	}
} );

module.exports = UpdateNotice;
