/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	joinClasses = require( 'react/lib/joinClasses' ),
	noop = require( 'lodash/utility/noop' );

/**
 * Internal dependencies
 */
var Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {
	displayName: 'SimpleNotice',

	getDefaultProps: function() {
		return {
			status: 'is-info',
			showDismiss: true,
			className: '',
			onClick: noop
		};
	},

	propTypes: {
		// we should validate the allowed statuses
		status: React.PropTypes.string,
		showDismiss: React.PropTypes.bool,
		isCompact: React.PropTypes.bool,
		text: React.PropTypes.oneOfType( [
			React.PropTypes.string,
			React.PropTypes.object
		] ),
		className: React.PropTypes.string
	},

	renderChildren: function() {
		let content;

		if ( typeof this.props.children === 'string' ) {
			return <span className="notice__text">{ this.props.children }</span>;
		}

		if ( this.props.text ) {
			content = [ this.props.children ];
			content.unshift( <span key="notice_text" className="notice__text">{ this.props.text }</span> );
		} else {
			content = <span key="notice_text" className="notice__text">{ this.props.children }</span>;
		}

		return content;
	},

	render: function() {
		var noticeClass, dismiss;

		// The class determines the nature of a notice
		// and its status.
		noticeClass = joinClasses( 'notice', this.props.status );

		if ( this.props.isCompact ) {
			noticeClass = joinClasses( noticeClass, 'is-compact' );
		}

		// By default, a dismiss button is rendered to
		// allow the user to hide the notice
		if ( this.props.showDismiss ) {
			noticeClass = joinClasses( noticeClass, 'is-dismissable' );
			dismiss = (
				<span tabIndex="0" className="notice__dismiss" onClick={ this.props.onClick } >
					<Gridicon icon="cross" size={ 24 } />
					<span className="screen-reader-text">{ this.translate( 'Dismiss' ) }</span>
				</span>
				);
		}

		return (
			<div className={ joinClasses( this.props.className, noticeClass ) }>
				{ this.renderChildren() }
				{ dismiss }
			</div>
		);
	}

} );
