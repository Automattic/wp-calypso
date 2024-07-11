import { isEnabled } from '@automattic/calypso-config';
import { Gridicon, Button } from '@automattic/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import React, { Component, Fragment, forwardRef } from 'react';
import { navigate } from 'calypso/lib/navigate';
import type { ReactNode, LegacyRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

interface MasterbarSubItemProps {
	label: string;
	url?: string;
	onClick?: () => void;
}
interface MasterbarItemProps {
	url?: string;
	innerRef?: LegacyRef< HTMLButtonElement | HTMLAnchorElement >;
	tipTarget?: string;
	onClick?: () => void;
	tooltip?: string;
	icon?: ReactNode;
	className?: string;
	isActive?: boolean;
	preloadSection?: () => void;
	hasUnseen?: boolean;
	children?: ReactNode;
	alwaysShowContent?: boolean;
	disabled?: boolean;
	subItems?: Array< MasterbarSubItemProps >;
}

class MasterbarItem extends Component< MasterbarItemProps > {
	static propTypes = {
		url: PropTypes.string,
		tipTarget: PropTypes.string,
		onClick: PropTypes.func,
		tooltip: PropTypes.string,
		icon: PropTypes.oneOfType( [ PropTypes.element, PropTypes.string ] ),
		className: PropTypes.string,
		isActive: PropTypes.bool,
		preloadSection: PropTypes.func,
		hasUnseen: PropTypes.bool,
		alwaysShowContent: PropTypes.bool,
		subItems: PropTypes.array,
	};

	static defaultProps = {
		icon: '',
		onClick: noop,
		hasUnseen: false,
		url: '',
	};

	state = {
		isOpenByTouch: false,
	};

	componentButtonRef = React.createRef< HTMLButtonElement >();
	componentDivRef = React.createRef< HTMLDivElement >();

	_preloaded = false;

	componentDidMount() {
		document.addEventListener( 'touchstart', this.closeMenuOnOutsideTouch );
		return () => document.removeEventListener( 'touchstart', this.closeMenuOnOutsideTouch );
	}

	preload = () => {
		if ( ! this._preloaded && typeof this.props.preloadSection === 'function' ) {
			this._preloaded = true;
			this.props.preloadSection();
		}
	};

	renderChildren() {
		const { children, hasUnseen, icon } = this.props;

		return (
			<Fragment>
				{ hasUnseen && (
					<span className="masterbar__item-bubble" aria-label="You have unseen content" />
				) }
				{ !! icon && ( typeof icon !== 'string' ? icon : <Gridicon icon={ icon } size={ 24 } /> ) }
				{ children && <span className="masterbar__item-content">{ children }</span> }
			</Fragment>
		);
	}

	renderSubItems() {
		const { subItems } = this.props;
		if ( ! subItems ) {
			return null;
		}
		return (
			<ul className="masterbar__item-subitems">
				{ subItems.map( ( item, i ) => (
					<li key={ i } className="masterbar__item-subitems-item">
						{ item.onClick && (
							<Button
								className="is-link"
								onClick={ item.onClick }
								onTouchEnd={ ( ev: React.TouchEvent ) => {
									ev.preventDefault();
									this.setState( { isOpenByTouch: false } );
									item.onClick && item.onClick();
								} }
							>
								{ item.label }
							</Button>
						) }
						{ ! item.onClick && item.url && (
							<a href={ item.url } onTouchEnd={ this.navigateSubAnchorTouch }>
								{ item.label }
							</a>
						) }
					</li>
				) ) }
			</ul>
		);
	}

	toggleMenuByTouch = ( event: React.TouchEvent ) => {
		event.preventDefault();
		this.setState( { isOpenByTouch: ! this.state.isOpenByTouch } );
	};

	navigateSubAnchorTouch = ( event: React.TouchEvent ) => {
		event.preventDefault();
		const url = event.currentTarget.getAttribute( 'href' );
		if ( url ) {
			navigate( url );
		}
		this.setState( { isOpenByTouch: false } );
	};

	closeMenuOnOutsideTouch = ( event: TouchEvent ) => {
		if ( ! this.props.subItems ) {
			return;
		}

		const isInComponentButtonRef = this.componentButtonRef.current?.contains(
			event.target as Node
		);
		const isInComponentDivRef = this.componentDivRef.current?.contains( event.target as Node );

		if ( ! isInComponentButtonRef && ! isInComponentDivRef ) {
			this.setState( { isOpenByTouch: false } );
		}
	};

	render() {
		const itemClasses = clsx( 'masterbar__item', this.props.className, {
			'is-active': this.props.isActive,
			'has-unseen': this.props.hasUnseen,
			'masterbar__item--always-show-content': this.props.alwaysShowContent,
			'has-subitems': this.props.subItems,
			'is-open': this.state.isOpenByTouch,
			mb: isEnabled( 'layout/mb' ),
		} );

		const attributes = {
			'data-tip-target': this.props.tipTarget,
			onClick: this.props.onClick,
			title: this.props.tooltip,
			className: itemClasses,
			onTouchStart: this.preload,
			onMouseEnter: this.preload,
			disabled: this.props.disabled,
		};

		if ( this.props.url && ! this.props.subItems ) {
			return (
				<a
					{ ...attributes }
					href={ this.props.url }
					ref={ this.props.innerRef as LegacyRef< HTMLAnchorElement > }
				>
					{ this.renderChildren() }
				</a>
			);
		}

		if ( this.props.url && this.props.subItems ) {
			return (
				<button { ...attributes } ref={ this.componentButtonRef }>
					<a
						href={ this.props.url }
						ref={ this.props.innerRef as LegacyRef< HTMLAnchorElement > }
						onTouchEnd={ this.toggleMenuByTouch }
					>
						{ this.renderChildren() }
					</a>
					{ this.renderSubItems() }
				</button>
			);
		}

		return (
			<div ref={ this.componentDivRef }>
				<button
					{ ...attributes }
					ref={ this.props.innerRef as LegacyRef< HTMLButtonElement > }
					onTouchEnd={ this.toggleMenuByTouch }
				>
					{ this.renderChildren() }
					{ this.renderSubItems() }
				</button>
			</div>
		);
	}
}

export default forwardRef< HTMLButtonElement | HTMLAnchorElement, MasterbarItemProps >(
	( props, ref ) => <MasterbarItem innerRef={ ref } { ...props } />
);
