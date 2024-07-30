import { Gridicon, Button } from '@automattic/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import React, { Component, Fragment, forwardRef } from 'react';
import { navigate } from 'calypso/lib/navigate';
import ItemBorderWrapper from './item-border-wrapper';
import type { ReactNode, LegacyRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

interface MasterbarSubItemProps {
	label: string;
	url?: string;
	onClick?: () => void;
	className?: string;
}
interface MasterbarItemProps {
	url?: string;
	innerRef?: LegacyRef< HTMLButtonElement | HTMLAnchorElement >;
	tipTarget?: string;
	onClick?: () => void;
	tooltip?: string;
	icon?: ReactNode;
	className?: string;
	wrapperClassName?: string;
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
		isOpenForNonMouseFlow: false,
	};

	componentButtonRef = React.createRef< HTMLButtonElement >();
	componentDivRef = React.createRef< HTMLDivElement >();

	_preloaded = false;

	componentDidMount() {
		document.addEventListener( 'touchstart', this.closeMenuOnOutsideInteraction );
		document.addEventListener( 'keydown', this.closeMenuOnOutsideInteraction );
		document.addEventListener( 'click', this.closeMenuOnOutsideInteraction );
		return () => {
			document.removeEventListener( 'touchstart', this.closeMenuOnOutsideInteraction );
			document.removeEventListener( 'keydown', this.closeMenuOnOutsideInteraction );
			document.addEventListener( 'click', this.closeMenuOnOutsideInteraction );
		};
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
					<li key={ i } className={ clsx( 'masterbar__item-subitems-item', item.className ) }>
						{ item.onClick && (
							<Button
								className="is-link"
								onClick={ item.onClick }
								onTouchEnd={ ( ev: React.TouchEvent ) =>
									this.submenuButtonTouch( ev, item.onClick )
								}
								onKeyDown={ ( ev: React.KeyboardEvent ) =>
									this.submenuButtonByKey( ev, item.onClick )
								}
							>
								{ item.label }
							</Button>
						) }
						{ ! item.onClick && item.url && (
							<a
								href={ item.url }
								onTouchEnd={ this.navigateSubAnchorTouch }
								onKeyDown={ this.navigateSubAnchorByKey }
							>
								{ item.label }
							</a>
						) }
					</li>
				) ) }
			</ul>
		);
	}

	toggleMenuByTouch = ( event: React.TouchEvent | React.KeyboardEvent ) => {
		// If there are no subItems, there is nothing to toggle.
		if ( ! this.props.subItems ) {
			return;
		}
		// Prevent navigation by touching the parent menu item, and trigger toggling the menu instead.
		event.preventDefault();
		this.setState( { isOpenForNonMouseFlow: ! this.state.isOpenForNonMouseFlow } );
	};

	toggleMenuByKey = ( event: React.KeyboardEvent ) => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			this.toggleMenuByTouch( event );
		}
	};

	navigateSubAnchorTouch = ( event: React.TouchEvent | React.KeyboardEvent ) => {
		// We must prevent the default anchor behavior and navigate manually. Otherwise there is a
		// race condition between the click on the anchor firing and the menu closing before that
		// can happen.
		event.preventDefault();
		const url = event.currentTarget.getAttribute( 'href' );
		if ( url ) {
			navigate( url );
		}
		this.setState( { isOpenForNonMouseFlow: false } );
	};

	navigateSubAnchorByKey = ( event: React.KeyboardEvent ) => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			this.navigateSubAnchorTouch( event );
		}
	};

	submenuButtonTouch = (
		event: React.TouchEvent | React.KeyboardEvent,
		onClick: ( () => void ) | undefined
	) => {
		event.preventDefault();
		this.setState( { isOpenForNonMouseFlow: false } );
		onClick && onClick();
	};

	submenuButtonByKey = ( event: React.KeyboardEvent, onClick: ( () => void ) | undefined ) => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			this.submenuButtonTouch( event, onClick );
		}
	};

	closeMenuOnOutsideInteraction = ( event: TouchEvent | KeyboardEvent | MouseEvent ) => {
		// If no subItems or the menu is already closed, there is nothing to close.
		if ( ! this.props.subItems || ! this.state.isOpenForNonMouseFlow ) {
			return;
		}

		// Check refs to see if the touch event started inside our component, if it didn't, close the menu.
		const isInComponentButtonRef = this.componentButtonRef.current?.contains(
			event.target as Node
		);
		const isInComponentDivRef = this.componentDivRef.current?.contains( event.target as Node );

		if ( ! isInComponentButtonRef && ! isInComponentDivRef ) {
			this.setState( { isOpenForNonMouseFlow: false } );
		}
	};

	render() {
		const itemClasses = clsx( 'masterbar__item', this.props.className, {
			'is-active': this.props.isActive,
			'has-unseen': this.props.hasUnseen,
			'masterbar__item--always-show-content': this.props.alwaysShowContent,
			'has-subitems': this.props.subItems,
			'is-open': this.state.isOpenForNonMouseFlow,
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
					<ItemBorderWrapper isActive={ this.props.isActive } />
					{ this.renderChildren() }
				</a>
			);
		}

		if ( this.props.url && this.props.subItems ) {
			return (
				<button
					{ ...attributes }
					ref={ this.componentButtonRef }
					onKeyDown={ this.toggleMenuByKey }
				>
					<ItemBorderWrapper isActive={ this.props.isActive } />
					<a
						href={ this.props.url }
						ref={ this.props.innerRef as LegacyRef< HTMLAnchorElement > }
						onTouchEnd={ this.toggleMenuByTouch }
						tabIndex={ -1 }
					>
						{ this.renderChildren() }
					</a>
					{ this.renderSubItems() }
				</button>
			);
		}

		return (
			<div className={ this.props.wrapperClassName } ref={ this.componentDivRef }>
				<ItemBorderWrapper isActive={ this.props.isActive } />
				<button
					{ ...attributes }
					ref={ this.props.innerRef as LegacyRef< HTMLButtonElement > }
					onKeyDown={ this.props.subItems && this.toggleMenuByKey }
					onTouchEnd={ this.props.subItems && this.toggleMenuByTouch }
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
