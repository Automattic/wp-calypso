import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, isValidElement } from 'react';
// @todo: Convert to import from `components/gridicon`
// which makes Calypso mysteriously crash at the moment.
//
// eslint-disable-next-line no-restricted-imports

import './style.scss';

/**
 * Module constants
 */
const GRIDICONS_WITH_DROP = [
	'add',
	'cross-circle',
	'ellipsis-circle',
	'help',
	'info',
	'notice',
	'pause',
	'play',
	'spam',
];
const noop = () => {};

export class Notice extends Component {
	static defaultProps = {
		className: '',
		duration: 0,
		icon: null,
		isCompact: false,
		isLoading: false,
		onDismissClick: noop,
		status: null,
		text: null,
		isReskinned: false,
	};

	static propTypes = {
		className: PropTypes.string,
		duration: PropTypes.number,
		icon: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ),
		isCompact: PropTypes.bool,
		isLoading: PropTypes.bool,
		onDismissClick: PropTypes.func,
		showDismiss: PropTypes.bool,
		status: PropTypes.oneOf( [
			'is-error',
			'is-info',
			'is-success',
			'is-warning',
			'is-plain',
			'is-transparent-info',
		] ),
		text: PropTypes.node,
		translate: PropTypes.func.isRequired,
		isReskinned: PropTypes.bool,
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

	componentDidUpdate() {
		clearTimeout( this.dismissTimeout );

		if ( this.props.duration > 0 ) {
			this.dismissTimeout = setTimeout( this.props.onDismissClick, this.props.duration );
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
			case 'is-transparent-info':
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
			isLoading,
			onDismissClick,
			showDismiss = ! isCompact, // by default, show on normal notices, don't show on compact ones
			status,
			text,
			translate,
			isReskinned,
		} = this.props;
		const classes = clsx( 'notice', status, className, {
			'is-compact': isCompact,
			'is-loading': isLoading,
			'is-dismissable': showDismiss,
			'is-reskinned': isReskinned,
		} );

		let iconNeedsDrop = false;
		let renderedIcon = null;
		if ( icon && isValidElement( icon ) ) {
			renderedIcon = icon;
		} else {
			const iconName = icon || this.getIcon();
			renderedIcon = <Gridicon className="notice__icon" icon={ iconName } size={ 24 } />;
			iconNeedsDrop = GRIDICONS_WITH_DROP.includes( iconName );
		}

		return (
			<div className={ classes } role="status" aria-label={ translate( 'Notice' ) }>
				<span className="notice__icon-wrapper">
					{ iconNeedsDrop && <span className="notice__icon-wrapper-drop" /> }
					{ renderedIcon }
				</span>
				<span className="notice__content">
					<span className="notice__text">{ text ? text : children }</span>
				</span>
				{ text ? children : null }
				{ showDismiss && (
					<button
						className="notice__dismiss"
						onClick={ onDismissClick }
						aria-label={ translate( 'Dismiss' ) }
					>
						<Gridicon icon="cross" size={ 24 } />
					</button>
				) }
			</div>
		);
	}
}

export default localize( Notice );
