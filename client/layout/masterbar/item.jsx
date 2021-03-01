/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import { isFunction, noop } from 'lodash';
import Gridicon from 'calypso/components/gridicon';
import TranslatableString from 'calypso/components/translatable/proptype';

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
	};

	_preloaded = false;

	preload = () => {
		if ( ! this._preloaded && isFunction( this.props.preloadSection ) ) {
			this._preloaded = true;
			this.props.preloadSection();
		}
	};

	render() {
		const itemClasses = classNames( 'masterbar__item', this.props.className, {
			'is-active': this.props.isActive,
			'has-unseen': this.props.hasUnseen,
		} );

		return (
			<a
				data-tip-target={ this.props.tipTarget }
				href={ this.props.url }
				onClick={ this.props.onClick }
				title={ this.props.tooltip }
				className={ itemClasses }
				onTouchStart={ this.preload }
				onMouseEnter={ this.preload }
			>
				{ this.props.hasUnseen && (
					<span className="masterbar__item-bubble" aria-label="You have unseen content" />
				) }
				{ !! this.props.icon && <Gridicon icon={ this.props.icon } size={ 24 } /> }
				<span className="masterbar__item-content">{ this.props.children }</span>
			</a>
		);
	}
}

export default MasterbarItem;
