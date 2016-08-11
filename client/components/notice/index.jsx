/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classnames from 'classnames';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import EllipsisMenu from 'components/ellipsis-menu';
import PopoverMenuItem from 'components/popover/menu-item';
import Gridicon from 'components/gridicon';
import { isMobile } from 'lib/viewport';
import NoticeAction from './notice-action';

export default React.createClass( {
	displayName: 'Notice',
	dismissTimeout: null,

	getDefaultProps() {
		return {
			actions: [],
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
		className: PropTypes.string,
		actions: PropTypes.arrayOf( PropTypes.object )
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
			return <span className="notice__text"><span>{ this.props.children }</span></span>;
		}

		if ( this.props.text ) {
			if ( typeof this.props.text === 'string' ) {
				text = <span>{ this.props.text }</span>;
			} else {
				text = this.props.text;
			}

			content = [ this.props.children ];
			content.unshift( <span key="notice_text" className="notice__text">{ text }</span> );
		} else {
			content = <span key="notice_text" className="notice__text">{ this.props.children }</span>;
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

	renderButton() {
		let { actions } = this.props;
		if ( ! actions.length ) {
			return;
		}

		const { showDismiss, onDismissClick } = this.props;
		if ( showDismiss ) {
			actions = actions.concat( {
				text: this.translate( 'Dismiss' ),
				onClick: onDismissClick
			} );
		}

		if ( actions.length > 1 ) {
			return (
				<EllipsisMenu position={ `${ isMobile() ? 'top' : 'bottom' } left` }>
					{ actions.map( ( action, i ) => (
						<PopoverMenuItem
							key={ i }
							target={ action.external ? '_blank' : null }
							{ ...action }>
							{ action.text }
						</PopoverMenuItem>
					) ) }
				</EllipsisMenu>
			);
		}

		return actions.map( ( action, i ) => (
			<NoticeAction key={ i } { ...action }>
				{ action.text }
			</NoticeAction>
		) );
	},

	render() {
		const { actions, status, isCompact, showDismiss, onDismissClick } = this.props;

		// The class determines the nature of a notice
		// and its status.
		const noticeClass = classnames( 'notice', status, {
			'is-compact': isCompact,
			'is-dismissable': showDismiss
		} );

		// By default, a dismiss button is rendered to
		// allow the user to hide the notice
		let dismiss;
		if ( ! actions.length && showDismiss ) {
			dismiss = (
				<span tabIndex="0" className="notice__dismiss" onClick={ onDismissClick } >
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
				{ this.renderButton() }
				{ dismiss }
			</div>
		);
	}
} );
