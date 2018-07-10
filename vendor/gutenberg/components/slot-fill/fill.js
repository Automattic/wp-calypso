/**
 * External dependencies
 */
import { noop, isFunction } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component, createPortal } from '@wordpress/element';

let occurrences = 0;

class Fill extends Component {
	constructor() {
		super( ...arguments );
		this.occurrence = ++occurrences;
	}

	componentDidMount() {
		const { registerFill = noop } = this.context;

		registerFill( this.props.name, this );
	}

	componentWillUpdate() {
		if ( ! this.occurrence ) {
			this.occurrence = ++occurrences;
		}
		const { getSlot = noop } = this.context;
		const slot = getSlot( this.props.name );
		if ( slot && ! slot.props.bubblesVirtually ) {
			slot.forceUpdate();
		}
	}

	componentWillUnmount() {
		const { unregisterFill = noop } = this.context;

		unregisterFill( this.props.name, this );
	}

	componentDidUpdate( prevProps ) {
		const { name } = this.props;
		const {
			unregisterFill = noop,
			registerFill = noop,
		} = this.context;

		if ( prevProps.name !== name ) {
			unregisterFill( prevProps.name, this );
			registerFill( name, this );
		}
	}

	resetOccurrence() {
		this.occurrence = null;
	}

	render() {
		const { getSlot = noop } = this.context;
		const { name } = this.props;
		let { children } = this.props;
		const slot = getSlot( name );

		if ( ! slot || ! slot.props.bubblesVirtually ) {
			return null;
		}

		// If a function is passed as a child, provide it with the fillProps.
		if ( isFunction( children ) ) {
			children = children( slot.props.fillProps );
		}

		return createPortal( children, slot.node );
	}
}

Fill.contextTypes = {
	getSlot: noop,
	registerFill: noop,
	unregisterFill: noop,
};

export default Fill;
