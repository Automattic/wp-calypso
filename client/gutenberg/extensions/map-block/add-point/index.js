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
			popoverVisible: false,
			isVisible: true
		};
		this.onAddPoint = this.onAddPoint.bind( this );
		this.showPopover = this.showPopover.bind( this );
		this.hidePopover = this.hidePopover.bind( this );
	}

	showPopover() {
		this.setState( { popoverVisible: true } );
	}

	hidePopover( e ){
		this.setState( { popoverVisible: false } );
		if ( e ) {
			e.stopPropagation();
		}
	}

	onAddPoint( point ) {
		this.props.onAddPoint( point );
		this.hidePopover();
	}

	render() {
		const { popoverVisible } = this.state;
		const { isVisible } = this.props;
		const { showPopover, hidePopover, onAddPoint } = this;
		if ( ! isVisible ) {
			return null;
		}
		return (
			<Button
				className='map__add_btn'
				onClick={ showPopover }
			>Add point
				{ popoverVisible && (
					<Popover className='map__popover'>
						<Button
							className='map__popover_close'
							onClick={ hidePopover }
						>
							<Dashicon icon="no" />
						</Button>
						<LocationSearch
							onAddPoint={ onAddPoint }
							label={ __( 'Add a location' ) }
						/>
					</Popover>
				) }
			</Button>
		);
	}

}

AddPoint.defaultProps = {
	onAddPoint: () => {},
	isVisible: true
}

export default AddPoint;
