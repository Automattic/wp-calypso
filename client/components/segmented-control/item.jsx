/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

class SegmentedControlItem extends React.Component {
	static propTypes = {
		children: PropTypes.node.isRequired,
		path: PropTypes.string,
		selected: PropTypes.bool,
		title: PropTypes.string,
		value: PropTypes.string,
		onClick: PropTypes.func,
		index: PropTypes.number,
	};

	static defaultProps = {
		selected: false,
	};

	handleKeyEvent = ( event ) => {
		switch ( event.keyCode ) {
			case 13: // enter
			case 32: // space
				event.preventDefault();
				document.activeElement.click();
				break;
		}
	};

	render() {
		const itemClassName = classNames( {
			'segmented-control__item': true,
			'is-selected': this.props.selected,
		} );

		const linkClassName = classNames( 'segmented-control__link', {
			[ `item-index-${ this.props.index }` ]: this.props.index != null,
		} );

		return (
			<li className={ itemClassName }>
				<a
					href={ this.props.path }
					className={ linkClassName }
					onClick={ this.props.onClick }
					title={ this.props.title }
					data-e2e-value={ this.props.value }
					role="radio"
					tabIndex={ 0 }
					aria-checked={ this.props.selected }
					onKeyDown={ this.handleKeyEvent }
				>
					<span className="segmented-control__text">{ this.props.children }</span>
				</a>
			</li>
		);
	}
}

export default SegmentedControlItem;
