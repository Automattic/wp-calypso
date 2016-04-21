/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classnames from 'classnames';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

const statusIcons = {
	'is-info': 'info',
	'is-success': 'checkmark',
	'is-error': 'notice',
	'is-warning': 'notice',
	'is-update': 'arrow-up',
};

export default React.createClass( {
	displayName: 'Notice',
	dismissTimeout: null,

	getDefaultProps() {
		return {
			duration: 0,
			status: null,
			showDismiss: true,
			className: '',
			onDismissClick: noop
		};
	},

	propTypes: {
		noticeId: PropTypes.string,
		status: PropTypes.oneOf( Object.keys( statusIcons ) ),
		showDismiss: PropTypes.bool,
		isCompact: PropTypes.bool,
		duration: PropTypes.number,
		text: PropTypes.oneOfType( [
			PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ),
			PropTypes.arrayOf( PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ) )
		] ),
		icon: PropTypes.string,
		className: PropTypes.string
	},

	componentDidMount() {
		if ( this.props.duration > 0 ) {
			this.dismissTimeout = setTimeout( this.handleDismissClick, this.props.duration );
		}
	},

	componentWillUnmount() {
		if ( this.dismissTimeout ) {
			clearTimeout( this.dismissTimeout );
		}
	},

	handleDismissClick() {
		this.props.onDismissClick( this.props.noticeId );
	},

	renderChildren() {
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

	getIcon() {
		return statusIcons[this.props.status] || 'info';
	},

	render() {
		let dismiss;

		// The class determines the nature of a notice
		// and its status.
		let noticeClass = classnames( 'notice', this.props.status );

		if ( this.props.isCompact ) {
			noticeClass = classnames( noticeClass, 'is-compact' );
		}

		// By default, a dismiss button is rendered to
		// allow the user to hide the notice
		if ( this.props.showDismiss ) {
			noticeClass = classnames( noticeClass, 'is-dismissable' );
			dismiss = (
				<span tabIndex="0" className="notice__dismiss" onClick={ this.handleDismissClick } >
					<Gridicon icon="cross" size={ 24 } />
					<span className="screen-reader-text">{ this.translate( 'Dismiss' ) }</span>
				</span>
				);
		}

		return (
			<div className={ classnames( this.props.className, noticeClass ) }>
				<Gridicon className="notice__icon" icon={ this.props.icon || this.getIcon() } size={ 24 } />
				<div className="notice__content">
					{ this.renderChildren() }
				</div>
				{ dismiss }
			</div>
		);
	}
} );
