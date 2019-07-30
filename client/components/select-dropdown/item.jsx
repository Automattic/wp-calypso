/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Count from 'components/count';
import TranslatableString from 'components/translatable/proptype';

const SelectDropdownItem = React.forwardRef( ( props, ref ) => {
	const optionClassName = classNames( props.className, {
		'select-dropdown__item': true,
		'is-selected': props.selected,
		'is-disabled': props.disabled,
		'has-icon': !! props.icon,
	} );

	return (
		<li className="select-dropdown__option">
			<a
				ref={ ref }
				href={ props.path }
				className={ optionClassName }
				onClick={ props.disabled ? null : props.onClick }
				data-bold-text={ props.value || props.children }
				role="option"
				tabIndex={ props.isDropdownOpen ? 0 : '' }
				aria-selected={ props.selected }
				data-e2e-title={ props.e2eTitle }
			>
				<span className="select-dropdown__item-text">
					{ props.icon && props.icon.type === Gridicon ? props.icon : null }
					{ props.children }
				</span>
				{ 'number' === typeof props.count && (
					<span data-text={ props.count } className="select-dropdown__item-count">
						<Count count={ props.count } compact={ props.compactCount } />
					</span>
				) }
			</a>
		</li>
	);
} );

SelectDropdownItem.displayName = 'SelectDropdownItem';

SelectDropdownItem.propTypes = {
	children: TranslatableString.isRequired,
	compactCount: PropTypes.bool,
	path: PropTypes.string,
	isDropdownOpen: PropTypes.bool,
	selected: PropTypes.bool,
	onClick: PropTypes.func,
	count: PropTypes.number,
	disabled: PropTypes.bool,
	icon: PropTypes.element,
};

SelectDropdownItem.defaultProps = {
	isDropdownOpen: false,
	selected: false,
};

export default SelectDropdownItem;
