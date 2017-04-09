/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import isFunction from 'lodash/isFunction';
import Gridicon from 'gridicons';

export default React.createClass( {
	displayName: 'MasterbarItem',

	propTypes: {
		url: React.PropTypes.string,
		onClick: React.PropTypes.func,
		tooltip: React.PropTypes.string,
		icon: React.PropTypes.string,
		className: React.PropTypes.string,
		isActive: React.PropTypes.bool,
		preloadSection: React.PropTypes.func
	},

	_preloaded: false,

	getDefaultProps() {
		return {
			icon: '',
			onClick: noop
		};
	},

	preload() {
		if ( ! this._preloaded && isFunction( this.props.preloadSection ) ) {
			this._preloaded = true;
			this.props.preloadSection();
		}
	},

	render() {
		const itemClasses = classNames( 'masterbar__item', this.props.className, {
			'is-active': this.props.isActive,
		} );

		return (
			<a
				data-tip-target={ this.props.tipTarget }
				href={ this.props.url }
				onClick={ this.props.onClick }
				title={ this.props.tooltip }
				className={ itemClasses }
				onTouchStart={ this.preload }
				onMouseEnter={ this.preload }>
				{ !! this.props.icon &&
					<Gridicon icon={ this.props.icon } size={ 24 } />
				}
				<span className="masterbar__item-content">{
						this.props.children
				}</span>
			</a>
		);
	}
} );
