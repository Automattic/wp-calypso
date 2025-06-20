import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';

class SegmentedControlItem extends Component {
	static propTypes = {
		children: PropTypes.node.isRequired,
		path: PropTypes.string,
		selected: PropTypes.bool,
		title: PropTypes.string,
		value: PropTypes.string,
		onClick: PropTypes.func,
		index: PropTypes.number,
		disabled: PropTypes.bool,
	};

	static defaultProps = {
		selected: false,
		disabled: false,
	};

	handleKeyEvent = ( event ) => {
		switch ( event.keyCode ) {
			case 13: // enter
			case 32: // space
				if ( this.props.disabled ) {
					return;
				}

				event.preventDefault();
				document.activeElement.click();
				break;
		}
	};

	render() {
		const itemClassName = clsx( {
			'segmented-control__item': true,
			'is-selected': this.props.selected,
		} );

		const linkClassName = clsx( 'segmented-control__link', {
			[ `item-index-${ this.props.index }` ]: this.props.index != null,
			disabled: this.props.disabled,
		} );

		return (
			<li className={ itemClassName } role="none">
				<a
					href={ this.props.path }
					className={ linkClassName }
					onClick={ this.props.onClick }
					title={ this.props.title }
					data-e2e-value={ this.props.value }
					role="radio"
					tabIndex={ 0 }
					aria-checked={ this.props.selected }
					aria-disabled={ this.props.disabled }
					onKeyDown={ this.handleKeyEvent }
				>
					<span className="segmented-control__text">{ this.props.children }</span>
				</a>
			</li>
		);
	}
}

export default SegmentedControlItem;
