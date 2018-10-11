/**
 * Wordpress dependencies
 */

import { __ } from '@wordpress/i18n';

import { Component } from '@wordpress/element';

import {
	Button,
	Dashicon,
	Popover
} from '@wordpress/components';

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */

import LocationSearch from '../location-search';

import './style.scss';

export class AddPoint extends Component {

	constructor() {
		super( ...arguments )
		this.state = {
			isVisible: false
		};
		this.onAddPoint = this.onAddPoint.bind( this );
		this.hidePopover = this.hidePopover.bind( this );
		this.hideSelf = this.hideSelf.bind( this );
	}

	hidePopover( e ){
		this.setState( { popoverVisible: false } );
		if ( e ) {
			e.stopPropagation();
		}
	}

	hideSelf() {
		this.setState( { isVisible: false } );
	}

	onAddPoint( point ) {
		this.props.onAddPoint( point );
		this.hidePopover();
	}

	render() {
		const { isVisible } = this.state;
		const { showPopover, hidePopover, onAddPoint, setState, hideSelf } = this;
		if ( ! isVisible ) {
			return null;
		}
		return (
			<Button
				className='map__add_btn'
				onClick={ showPopover }
			>
				Add point
				<Popover className='map__popover'>
					<Button
						className='map__popover_close'
						onClick={ hideSelf }
					>
						<Dashicon icon="no" />
					</Button>
					<LocationSearch
						onAddPoint={ onAddPoint }
						label={ __( 'Add a location' ) }
					/>
				</Popover>
			</Button>
		);
	}

}

AddPoint.defaultProps = {
	onAddPoint: () => {}
}

export default AddPoint;
