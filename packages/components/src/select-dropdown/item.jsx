import clsx from 'clsx';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import Count from '../count';
import TranslatableString from './translatable/proptype';

class SelectDropdownItem extends Component {
	static propTypes = {
		children: PropTypes.oneOfType( [ TranslatableString, PropTypes.node ] ).isRequired,
		compactCount: PropTypes.bool,
		path: PropTypes.string,
		selected: PropTypes.bool,
		onClick: PropTypes.func,
		count: PropTypes.number,
		disabled: PropTypes.bool,
		icon: PropTypes.element,
		ariaLabel: PropTypes.string,
		secondaryIcon: PropTypes.element,
	};

	static defaultProps = {
		selected: false,
	};

	linkRef = createRef();

	// called by the parent `SelectDropdown` component to focus the item on keyboard navigation
	focusLink() {
		this.linkRef.current.focus();
	}

	render() {
		const optionClassName = clsx( 'select-dropdown__item', this.props.className, {
			'is-selected': this.props.selected,
			'is-disabled': this.props.disabled,
			'has-icon': this.props.icon,
		} );

		const label = this.props.value || this.props.children;
		const ariaLabel =
			this.props.ariaLabel ||
			( 'number' === typeof this.props.count ? `${ label } (${ this.props.count })` : label );

		return (
			<li className="select-dropdown__option">
				<a
					ref={ this.linkRef }
					href={ this.props.path }
					className={ optionClassName }
					onClick={ this.props.disabled ? null : this.props.onClick }
					data-bold-text={ label }
					role="menuitem"
					tabIndex="0"
					aria-current={ this.props.selected }
					aria-label={ ariaLabel }
					data-e2e-title={ this.props.e2eTitle }
				>
					<span className="select-dropdown__item-text">
						{ this.props.icon }
						{ this.props.children }
					</span>
					{ 'number' === typeof this.props.count ? (
						<span data-text={ this.props.count } className="select-dropdown__item-count">
							<Count count={ this.props.count } compact={ this.props.compactCount } />
						</span>
					) : (
						<>{ this.props.secondaryIcon }</>
					) }
				</a>
			</li>
		);
	}
}

export default SelectDropdownItem;
