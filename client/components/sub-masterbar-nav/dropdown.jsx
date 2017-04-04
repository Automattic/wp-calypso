/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'gridicons';
import Item from './item';

export default class Dropdown extends Component {

	static propTypes = {
		children: PropTypes.func.isRequired,
		selected: PropTypes.shape( {
			label: PropTypes.string.isRequired,
			icon: PropTypes.string.isRequired
		} )
	};

	state = {
		collapsed: true
	};

	componentDidMount() {
		window.addEventListener( 'scroll', this.collapse );
	}

	componentWillUnmount() {
		window.removeEventListener( 'scroll', this.collapse );
	}

	render() {
		const className = classNames(
			'sub-masterbar-nav__dropdown',
			{ 'is-collapsed': this.state.collapsed }
		);

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
						{ this.props.children( { onSelect: this.collapse } ) }
					</div>
				</div>
			</div>
		);
	}

	toggle = () => {
		this.setState( ( state ) => ( {
			collapsed: ! state.collapsed
		} ) );
	}

	collapse = () => {
		this.setState( () => ( {
			collapsed: true
		} ) );
	}
}
