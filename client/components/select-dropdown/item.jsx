/**
 * External Dependencies
 */
import PropTypes from 'prop-types';

import React, { Component } from 'react';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Count from 'components/count';

class SelectDropdownItem extends Component {
	static propTypes = {
		children: PropTypes.string.isRequired,
		path: PropTypes.string,
		isDropdownOpen: PropTypes.bool,
		selected: PropTypes.bool,
		onClick: PropTypes.func,
		count: PropTypes.number,
		disabled: PropTypes.bool,
		icon: PropTypes.element,
	}

	static defaultProps = {
		isDropdownOpen: false,
		selected: false
	}

	render() {
		const optionClassName = classNames( this.props.className, {
			'select-dropdown__item': true,
			'is-selected': this.props.selected,
			'is-disabled': this.props.disabled,
			'has-icon': !! this.props.icon
		} );

		return (
			<li className="select-dropdown__option">
				<a
					ref="itemLink"
					href={ this.props.path }
					className={ optionClassName }
					onClick={ this.props.disabled ? null : this.props.onClick }
					data-bold-text={ this.props.value || this.props.children }
					role="menuitem"
					tabIndex={ this.props.isDropdownOpen ? 0 : '' }
					aria-selected={ this.props.selected } >
					<span className="select-dropdown__item-text">
						{
							this.props.icon && this.props.icon.type === Gridicon
								? this.props.icon
								: null
						}
						{ this.props.children }
					</span>
					{
						'number' === typeof this.props.count &&
						<span
							data-text={ this.props.count }
							className="select-dropdown__item-count"
						>
							<Count
								count={ this.props.count }
							/>
						</span>
					}
				</a>
			</li>
		);
	}
}

export default SelectDropdownItem;
