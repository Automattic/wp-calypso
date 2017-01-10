/**
 * External Dependencies
 */
import React, { Component } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Count from 'components/count';

class SelectDropdownItem extends Component {
	static propTypes = {
		children: React.PropTypes.string.isRequired,
		path: React.PropTypes.string,
		isDropdownOpen: React.PropTypes.bool,
		selected: React.PropTypes.bool,
		onClick: React.PropTypes.func,
		count: React.PropTypes.number
	}

	static defaultProps = {
		isDropdownOpen: false,
		selected: false
	}

	render() {
		const optionClassName = classNames( this.props.className, {
			'select-dropdown__item': true,
			'is-selected': this.props.selected,
			'is-disabled': this.props.disabled
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
