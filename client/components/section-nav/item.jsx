/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal Dependencies
 */
import Count from 'calypso/components/count';
import { preload } from 'calypso/sections-helper';

/**
 * Style dependencies
 */
import './item.scss';

class NavItem extends PureComponent {
	static propTypes = {
		itemType: PropTypes.string,
		path: PropTypes.string,
		selected: PropTypes.bool,
		tabIndex: PropTypes.number,
		onClick: PropTypes.func,
		onKeyPress: PropTypes.func,
		isExternalLink: PropTypes.bool,
		disabled: PropTypes.bool,
		count: PropTypes.oneOfType( [ PropTypes.number, PropTypes.bool ] ),
		compactCount: PropTypes.bool,
		className: PropTypes.string,
		preloadSectionName: PropTypes.string,
	};

	_preloaded = false;

	preload = () => {
		if ( ! this._preloaded && this.props.preloadSectionName ) {
			this._preloaded = true;
			preload( this.props.preloadSectionName );
		}
	};

	render() {
		const itemClassPrefix = this.props.itemType ? this.props.itemType : 'tab';
		const itemClasses = {
			'is-selected': this.props.selected,
			'is-external': this.props.isExternalLink,
		};
		itemClasses[ 'section-nav-' + itemClassPrefix ] = true;
		const itemClassName = classNames( this.props.className, itemClasses );

		let target, onClick;

		if ( this.props.isExternalLink ) {
			target = '_blank';
		}

		if ( ! this.props.disabled ) {
			onClick = this.props.onClick;
		}

		return (
			<li className={ itemClassName }>
				<a
					href={ this.props.path }
					target={ target }
					className={ 'section-nav-' + itemClassPrefix + '__link' }
					onClick={ onClick }
					onMouseEnter={ this.preload }
					tabIndex={ this.props.tabIndex || 0 }
					aria-current={ this.props.selected }
					disabled={ this.props.disabled }
					role="menuitem"
					rel={ this.props.isExternalLink ? 'external' : null }
					onKeyPress={ this.props.onKeyPress }
				>
					<span className={ 'section-nav-' + itemClassPrefix + '__text' }>
						{ this.props.children }
						{ 'number' === typeof this.props.count && (
							<Count count={ this.props.count } compact={ this.props.compactCount } />
						) }
					</span>
					{ this.props.isExternalLink ? <Gridicon icon="external" size={ 18 } /> : null }
				</a>
			</li>
		);
	}
}

export default NavItem;
