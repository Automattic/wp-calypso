/**
 * External Dependencies
 */
var React = require( 'react/addons' ),
	noop = require( 'lodash/utility/noop' ),
	classnames = require( 'classnames' );

var titleActions = require( 'lib/screen-title/actions' ),
	Gridicon = require( 'components/gridicon' );

var UpdateNotice = React.createClass( {
	mixins: [ React.addons.PureRenderMixin ],

	propTypes: {
		count: React.PropTypes.number.isRequired,
		onClick: React.PropTypes.func
	},

	getDefaultProps: function() {
		return { onClick: noop };
	},

	componentDidMount: function() {
		this.setCount();
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

	render: function() {
		var counterClasses = classnames( {
			'reader-update-notice': true,
			'is-active': this.props.count > 0
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
