/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import { isFunction, noop } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import TranslatableString from 'components/translatable/proptype';
import compareProps from 'lib/compare-props';

class MasterbarItem extends Component {
	static propTypes = {
		url: PropTypes.string,
		onClick: PropTypes.func,
		tooltip: TranslatableString,
		icon: PropTypes.string,
		className: PropTypes.string,
		isActive: PropTypes.bool,
		preloadSection: PropTypes.func,
	};

	static defaultProps = {
		icon: '',
		onClick: noop,
	};

	_preloaded = false;

	preload = () => {
		if ( ! this._preloaded && isFunction( this.props.preloadSection ) ) {
			this._preloaded = true;
			this.props.preloadSection();
		}
	};

	shouldSkipRender = compareProps( { ignore: [ 'onClick' ] } );
	shouldComponentUpdate( nextProps ) {
		return ! this.shouldSkipRender( this.props, nextProps );
	}

	onClick = e => {
		return this.props.onClick( e );
	};

	render() {
		const itemClasses = classNames( 'masterbar__item', this.props.className, {
			'is-active': this.props.isActive,
		} );

		return (
			<a
				data-tip-target={ this.props.tipTarget }
				href={ this.props.url }
				onClick={ this.onClick }
				title={ this.props.tooltip }
				className={ itemClasses }
				onTouchStart={ this.preload }
				onMouseEnter={ this.preload }
			>
				{ !! this.props.icon && <Gridicon icon={ this.props.icon } size={ 24 } /> }
				<span className="masterbar__item-content">{ this.props.children }</span>
			</a>
		);
	}
}

export default MasterbarItem;
