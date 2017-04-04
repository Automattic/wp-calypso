/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { find, noop } from 'lodash';

/**
 * Internal dependencies
 */
import Navbar from './navbar';
import Dropdown from './dropdown';
import Item from './item';

const OptionShape = PropTypes.shape( {
	label: PropTypes.string.isRequired,
	uri: PropTypes.string.isRequired,
	icon: PropTypes.string
} );

export default class SubMasterbarNav extends Component {
	static propTypes = {
		fallback: OptionShape,
		options: PropTypes.arrayOf( OptionShape ),
		uri: PropTypes.string.isRequired
	};

	static defaultProps = {
		options: []
	}

	render() {
		return (
			<div className="sub-masterbar-nav">
				<Dropdown selected={ this.getSelected() }>
					{ ( { onSelect } ) => (
						this.renderItems( onSelect )
					) }
				</Dropdown>
				<Navbar>
					{ this.renderItems( noop ) }
				</Navbar>
			</div>
		);
	}

	renderItems( onSelect ) {
		return this.props.options.map( ( item, index ) =>
			<Item
				key={ index }
				isSelected={ this.isSelected( item ) }
				onClick={ onSelect }
				label={ item.label }
				icon={ item.icon }
				href={ item.uri }
			/>
		);
	}

	isSelected( option ) {
		return option.uri === this.props.uri;
	}

	getSelected() {
		return find( this.props.options, ( option ) => this.isSelected( option ) ) || this.props.fallback;
	}
}
