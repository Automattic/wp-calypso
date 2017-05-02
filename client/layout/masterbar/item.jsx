/**
 * External dependencies
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import isFunction from 'lodash/isFunction';
import Gridicon from 'gridicons';

class MasterbarItem extends Component {
	constructor() {
		super();
		this._preloaded = false;
		this.preload = this.preload.bind( this );
	}

	preload() {
		if ( ! this._preloaded && isFunction( this.props.preloadSection ) ) {
			this._preloaded = true;
			this.props.preloadSection();
		}
	}

	render() {
		const itemClasses = classNames( 'masterbar__item', this.props.className, {
			'is-active': this.props.isActive,
		} );

		if ( this.props.isNotesItem ) {
			return (
				<div
					data-tip-target={ this.props.tipTarget }
					onClick={ this.props.onClick }
					title={ this.props.tooltip }
					className={ itemClasses }
					onTouchStart={ this.preload }
					onMouseEnter={ this.preload }>
					{ !! this.props.icon && <Gridicon icon={ this.props.icon } size={ 24 } />
					}
					<span className="masterbar__item-content">{
						this.props.children
					}</span>
				</div>
			);
		}

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
}

MasterbarItem.propTypes = {
	url: React.PropTypes.string,
	onClick: React.PropTypes.func,
	tooltip: React.PropTypes.string,
	icon: React.PropTypes.string,
	className: React.PropTypes.string,
	isActive: React.PropTypes.bool,
	isNotesItem: React.PropTypes.bool,
	preloadSection: React.PropTypes.func
};

MasterbarItem.defaultProps = {
	icon: '',
	onClick: noop
};

export default MasterbarItem;
