/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { find, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { isWithinBreakpoint } from 'lib/viewport';
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

	state = {
		collapsed: true
	};

	componentDidMount() {
		this.onResize();

		window.addEventListener( 'resize', this.onResize );
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.onResize );
	}

	render() {
		if ( this.state.isDropdown ) {
			return this.renderDropdown();
		}

		return this.renderNavbar();
	}

	renderDropdown() {
		return (
			<Dropdown selected={ this.getSelected() }>
				{ ( { onSelect } ) => (
					this.renderItems( onSelect )
				) }
			</Dropdown>
		);
	}

	renderNavbar() {
		return (
			<Navbar>
				{ this.renderItems( noop ) }
			</Navbar>
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

	onResize = () => {
		this.setState( () => ( {
			isDropdown: isWithinBreakpoint( '<660px' )
		} ) );
	}

	isSelected( option ) {
		return option.uri === this.props.uri;
	}

	getSelected() {
		return find( this.props.options, ( option ) => this.isSelected( option ) ) || this.props.fallback;
	}
}
