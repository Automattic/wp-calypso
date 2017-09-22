/**
 * External dependencies
 */
import classnames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

export class Notice extends Component {
	static defaultProps = {
		className: '',
		duration: 0,
		icon: null,
		isCompact: false,
		onDismissClick: noop,
		status: null,
		text: null,
	};

	static propTypes = {
		className: PropTypes.string,
		duration: PropTypes.number,
		icon: PropTypes.string,
		isCompact: PropTypes.bool,
		onDismissClick: PropTypes.func,
		showDismiss: PropTypes.bool,
		status: PropTypes.oneOf( [
			'is-error',
			'is-info',
			'is-success',
			'is-warning',
			'is-plain',
		] ),
		text: PropTypes.oneOfType( [
			PropTypes.arrayOf( PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ) ),
			PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ),
		] ),
		translate: PropTypes.func.isRequired,
	};

	dismissTimeout = null;

	componentDidMount() {
		if ( this.props.duration > 0 ) {
			this.dismissTimeout = setTimeout( this.props.onDismissClick, this.props.duration );
		}
	}

	componentWillUnmount() {
		if ( this.dismissTimeout ) {
			clearTimeout( this.dismissTimeout );
		}
	}

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
	}

	render() {
		const {
			children,
			className,
			icon,
			isCompact,
			onDismissClick,
			showDismiss = ! isCompact, // by default, show on normal notices, don't show on compact ones
			status,
			text,
			translate,
		} = this.props;
		const classes = classnames( 'notice', status, className, {
			'is-compact': isCompact,
			'is-dismissable': showDismiss
		} );

		return (
			<div className={ classes }>
				<Gridicon className="notice__icon" icon={ icon || this.getIcon() } size={ 24 } />
				<span className="notice__content">
					<span className="notice__text">
						{ text ? text : children }
					</span>
				</span>
				{ text ? children : null }
				{ showDismiss && (
					<span tabIndex="0" className="notice__dismiss" onClick={ onDismissClick } >
						<Gridicon icon="cross" size={ 24 } />
						<span className="notice__screen-reader-text screen-reader-text">{ translate( 'Dismiss' ) }</span>
					</span>
				) }
			</div>
		);
	}
}

export default localize( Notice );
