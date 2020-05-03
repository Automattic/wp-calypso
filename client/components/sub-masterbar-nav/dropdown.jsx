/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import Item from './item';

const OptionShape = PropTypes.shape( {
	label: PropTypes.string.isRequired,
	uri: PropTypes.string.isRequired,
	icon: PropTypes.string,
} );

export default class Dropdown extends Component {
	static propTypes = {
		selected: OptionShape,
		options: PropTypes.arrayOf( OptionShape ),
	};

	state = {
		collapsed: true,
	};

	componentDidMount() {
		window.addEventListener( 'scroll', this.collapse );
	}

	componentWillUnmount() {
		window.removeEventListener( 'scroll', this.collapse );
	}

	render() {
		const className = classNames( 'sub-masterbar-nav__dropdown', {
			'is-collapsed': this.state.collapsed,
		} );

		return (
			<div className={ className }>
				<div className="sub-masterbar-nav__select" onClick={ this.toggle }>
					<Item
						isSelected={ true }
						label={ this.props.selected.label }
						icon={ this.props.selected.icon }
					/>
					<Gridicon icon="chevron-down" className="sub-masterbar-nav__select-icon" />
				</div>
				<div className="sub-masterbar-nav__wrapper">
					<div className="sub-masterbar-nav__items">
						{ this.props.options.map( this.renderItem ) }
					</div>
				</div>
			</div>
		);
	}

	renderItem = ( item, index ) => {
		return (
			<Item
				key={ index }
				onClick={ this.collapse }
				label={ item.label }
				icon={ item.icon }
				href={ item.uri }
			/>
		);
	};

	toggle = () => {
		this.setState( ( state ) => ( {
			collapsed: ! state.collapsed,
		} ) );
	};

	collapse = () => {
		this.setState( () => ( {
			collapsed: true,
		} ) );
	};
}
