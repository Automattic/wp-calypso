/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	joinClasses = require( 'react/lib/joinClasses' );

/**
 * Internal dependencies
 */
var notices = require( 'notices' ),
	Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {
	displayName: 'Notice',

	getDefaultProps: function() {
		return {
			status: 'info',
			text: 'Some text here, please.',
			duration: 0,
			showDismiss: true,
			className: ''
		};
	},

	componentDidMount: function() {
		if ( this.props.duration > 0 ) {
			setTimeout( this.removeNotice, this.props.duration );
		}
	},

	removeNotice: function( event ) {
		if ( ! this.props.inline && this.props.raw.onRemoveCallback ) {
			notices.removeNotice( this.props.raw );
		}
		if ( this.props.raw.onRemoveCallback ) {
			this.props.raw.onRemoveCallback( event );
		}
	},

	handleClick: function( event ) {
		if ( this.props.onClick ) {
			this.props.onClick( event, this.removeNotice );
		}
	},

	render: function() {
		var alertClass, button, text, dismiss;

		// The class determines the nature of a notice
		// and its status.
		alertClass = 'notice ' + this.props.status;
		if ( this.props.isCompact ) {
			alertClass += ' is-compact';
		}

		// If provided with a link or click handler,
		// generate a button element.
		if ( this.props.button ) {
			button = ( <a className="notice__button" href={ this.props.href } onClick={ this.handleClick }>{ this.props.button }</a> );
		}

		text = (
			<span className="notice__text">
			{ this.props.text }
			{ button }
			</span>
		);

		// By default, a dismiss button is rendered to
		// allow the user to hide the notice
		if ( this.props.showDismiss ) {
			alertClass += ' is-dismissable';
			dismiss = (

				<span tabIndex="0" className="notice__dismiss" onClick={ this.removeNotice } >
					<Gridicon icon="cross" size={ 24 } />
					<span className="screen-reader-text">{ this.translate( 'Dismiss' ) }</span>
				</span>
				);
		}

		return (
			<div className={ joinClasses( this.props.className, alertClass ) }>
				{ text }
				{ dismiss }
			</div>
		);
	}

} );
