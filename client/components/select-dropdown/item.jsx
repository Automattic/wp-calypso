/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import Count from 'calypso/components/count';
import TranslatableString from 'calypso/components/translatable/proptype';

class SelectDropdownItem extends Component {
	static propTypes = {
		children: TranslatableString.isRequired,
		compactCount: PropTypes.bool,
		path: PropTypes.string,
		selected: PropTypes.bool,
		onClick: PropTypes.func,
		count: PropTypes.number,
		disabled: PropTypes.bool,
		icon: PropTypes.element,
	};

	static defaultProps = {
		selected: false,
	};

	linkRef = React.createRef();

	// called by the parent `SelectDropdown` component to focus the item on keyboard navigation
	focusLink() {
		this.linkRef.current.focus();
	}

	render() {
		const optionClassName = classNames( 'select-dropdown__item', this.props.className, {
			'is-selected': this.props.selected,
			'is-disabled': this.props.disabled,
			'has-icon': this.props.icon,
		} );

		return (
			<li className="select-dropdown__option">
				<a
					ref={ this.linkRef }
					href={ this.props.path }
					className={ optionClassName }
					onClick={ this.props.disabled ? null : this.props.onClick }
					data-bold-text={ this.props.value || this.props.children }
					role="menuitem"
					tabIndex="0"
					aria-current={ this.props.selected }
					data-e2e-title={ this.props.e2eTitle }
				>
					<span className="select-dropdown__item-text">
						{ this.props.icon && this.props.icon.type === Gridicon ? this.props.icon : null }
						{ this.props.children }
					</span>
					{ 'number' === typeof this.props.count && (
						<span data-text={ this.props.count } className="select-dropdown__item-count">
							<Count count={ this.props.count } compact={ this.props.compactCount } />
						</span>
					) }
				</a>
			</li>
		);
	}
}

export default SelectDropdownItem;
