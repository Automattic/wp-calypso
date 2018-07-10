/**
 * External dependencies
 */
import { pick, sortBy, forEach, without, noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';

class SlotFillProvider extends Component {
	constructor() {
		super( ...arguments );

		this.registerSlot = this.registerSlot.bind( this );
		this.registerFill = this.registerFill.bind( this );
		this.unregisterSlot = this.unregisterSlot.bind( this );
		this.unregisterFill = this.unregisterFill.bind( this );
		this.getSlot = this.getSlot.bind( this );
		this.getFills = this.getFills.bind( this );

		this.slots = {};
		this.fills = {};
	}

	getChildContext() {
		return pick( this, [
			'registerSlot',
			'registerFill',
			'unregisterSlot',
			'unregisterFill',
			'getSlot',
			'getFills',
		] );
	}

	registerSlot( name, slot ) {
		this.slots[ name ] = slot;
		this.forceUpdateFills( name );

		// Sometimes the fills are registered after the initial render of slot
		// But before the registerSlot call, we need to rerender the slot
		this.forceUpdateSlot( name );
	}

	registerFill( name, instance ) {
		this.fills[ name ] = [
			...( this.fills[ name ] || [] ),
			instance,
		];
		this.forceUpdateSlot( name );
	}

	unregisterSlot( name ) {
		delete this.slots[ name ];
		this.forceUpdateFills( name );
	}

	unregisterFill( name, instance ) {
		this.fills[ name ] = without(
			this.fills[ name ],
			instance
		);
		this.resetFillOccurrence( name );
		this.forceUpdateSlot( name );
	}

	getSlot( name ) {
		return this.slots[ name ];
	}

	getFills( name ) {
		return sortBy( this.fills[ name ], 'occurrence' );
	}

	resetFillOccurrence( name ) {
		forEach( this.fills[ name ], ( instance ) => {
			instance.resetOccurrence();
		} );
	}

	forceUpdateFills( name ) {
		forEach( this.fills[ name ], ( instance ) => {
			instance.forceUpdate();
		} );
	}

	forceUpdateSlot( name ) {
		const slot = this.getSlot( name );

		if ( slot ) {
			slot.forceUpdate();
		}
	}

	render() {
		return this.props.children;
	}
}

SlotFillProvider.childContextTypes = {
	registerSlot: noop,
	unregisterSlot: noop,
	registerFill: noop,
	unregisterFill: noop,
	getSlot: noop,
	getFills: noop,
};

export default SlotFillProvider;
