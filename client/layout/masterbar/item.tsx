import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component, Fragment, forwardRef } from 'react';
import type { ReactNode, LegacyRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

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
	};

	static defaultProps = {
		icon: '',
		onClick: noop,
		hasUnseen: false,
		url: '',
	};

	_preloaded = false;

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

	render() {
		const itemClasses = clsx( 'masterbar__item', this.props.className, {
			'is-active': this.props.isActive,
			'has-unseen': this.props.hasUnseen,
			'masterbar__item--always-show-content': this.props.alwaysShowContent,
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

		if ( this.props.url ) {
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

		return (
			<button { ...attributes } ref={ this.props.innerRef as LegacyRef< HTMLButtonElement > }>
				{ this.renderChildren() }
			</button>
		);
	}
}

export default forwardRef< HTMLButtonElement | HTMLAnchorElement, MasterbarItemProps >(
	( props, ref ) => <MasterbarItem innerRef={ ref } { ...props } />
);
