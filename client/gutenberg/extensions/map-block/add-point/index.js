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
		super( ...arguments );
		this.onAddPoint = this.onAddPoint.bind( this );
	}

	onAddPoint( point ) {

		this.props.onAddPoint( point );

	}

	render() {
		const {
			onClose,
			onAddPoint
		} = this.props;
		return (
			<Button
				className='map__add_btn'
			>
				Add point
				<Popover className='map__popover'>
					<Button
						className='map__popover_close'
						onClick={ onClose }
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
	onAddPoint: () => {},
	onClose: () => {}
}

export default AddPoint;
