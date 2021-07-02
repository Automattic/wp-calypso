/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import classNames from 'classnames';
import Gridicon from 'calypso/components/gridicon';
import TranslatableString from 'calypso/components/translatable/proptype';

const noop = () => {};

class MasterbarItem extends Component {
	static propTypes = {
		url: PropTypes.string,
		onClick: PropTypes.func,
		tooltip: TranslatableString,
		icon: PropTypes.string,
		className: PropTypes.string,
		isActive: PropTypes.bool,
		preloadSection: PropTypes.func,
		hasUnseen: PropTypes.bool,
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
		return (
			<Fragment>
				{ this.props.hasUnseen && (
					<span className="masterbar__item-bubble" aria-label="You have unseen content" />
				) }
				{ !! this.props.icon && <Gridicon icon={ this.props.icon } size={ 24 } /> }
				<span className="masterbar__item-content">{ this.props.children }</span>
			</Fragment>
		);
	}

	render() {
		const itemClasses = classNames( 'masterbar__item', this.props.className, {
			'is-active': this.props.isActive,
			'has-unseen': this.props.hasUnseen,
		} );

		const attributes = {
			'data-tip-target': this.props.tipTarget,
			onClick: this.props.onClick,
			title: this.props.tooltip,
			className: itemClasses,
			onTouchStart: this.preload,
			onMouseEnter: this.preload,
		};

		if ( this.props.url ) {
			return (
				<a { ...attributes } href={ this.props.url }>
					{ this.renderChildren() }
				</a>
			);
		}

		return <button { ...attributes }>{ this.renderChildren() }</button>;
	}
}

export default MasterbarItem;
