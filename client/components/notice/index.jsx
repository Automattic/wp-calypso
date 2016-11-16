/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classnames from 'classnames';
import noop from 'lodash/noop';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

export const Notice = React.createClass( {
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
		// we should validate the allowed statuses
		status: PropTypes.string,
		showDismiss: PropTypes.bool,
		isCompact: PropTypes.bool,
		duration: React.PropTypes.number,
		text: PropTypes.oneOfType( [
			PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ),
			PropTypes.arrayOf( PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ) )
		] ),
		icon: PropTypes.string,
		className: PropTypes.string
	},

	componentDidMount() {
		if ( this.props.duration > 0 ) {
			this.dismissTimeout = setTimeout( this.props.onDismissClick, this.props.duration );
		}
	},

	componentWillUnmount() {
		if ( this.dismissTimeout ) {
			clearTimeout( this.dismissTimeout );
		}
	},

	renderChildren() {
		let content, text;

		if ( typeof this.props.children === 'string' ) {
			return (
				<span className="notice__content">
					<span className="notice__text">
						<span>{ this.props.children }</span>
					</span>
				</span>
			);
		}

		if ( this.props.text ) {
			if ( typeof this.props.text === 'string' ) {
				text = <span>{ this.props.text }</span>;
			} else {
				text = this.props.text;
			}

			content = [ this.props.children ];
			content.unshift(
				<span className="notice__content">
					<span key="notice_text" className="notice__text">{ text }</span>
				</span>
			);
		} else {
			content =
				<span className="notice__content">
					<span key="notice_text" className="notice__text">{ this.props.children }</span>
				</span>
			;
		}

		return content;
	},

	getIcon() {
		let icon;

		switch ( this.props.status ) {
			case 'is-info':
				icon = 'info';
				break;
			case 'is-success':
				icon = 'checkmark';
				break;
			case 'is-error':
				icon = 'notice';
				break;
			case 'is-warning':
				icon = 'notice';
				break;
			default:
				icon = 'info';
				break;
		}

		return icon;
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
				<span tabIndex="0" className="notice__dismiss" onClick={ this.props.onDismissClick } >
					<Gridicon icon="cross" size={ 24 } />
					<span className="screen-reader-text">{ this.props.translate( 'Dismiss' ) }</span>
				</span>
				);
		}

		return (
			<div className={ classnames( this.props.className, noticeClass ) }>
				<Gridicon className="notice__icon" icon={ this.props.icon || this.getIcon() } size={ 24 } />
					{ this.renderChildren() }
				{ dismiss }
			</div>
		);
	}
} );

export default localize( Notice );
