/** @format */

/**
 * External dependencies
 */

import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { Button, Dashicon, Popover } from '@wordpress/components';

/**
 * Internal dependencies
 */

import LocationSearch from '../location-search';
import './style.scss';
export class AddPoint extends Component {
	render() {
		const { onClose, onAddPoint, api_key } = this.props;
		return (
			<Button className="component__add-point">
				{ __( 'Add marker', 'jetpack' ) }
				<Popover className="component__add-point__popover">
					<Button className="component__add-point__close" onClick={ onClose }>
						<Dashicon icon="no" />
					</Button>
					<LocationSearch
						onAddPoint={ onAddPoint }
						label={ __( 'Add a location', 'jetpack' ) }
						api_key={ api_key }
					/>
				</Popover>
			</Button>
		);
	}
}

AddPoint.defaultProps = {
	onAddPoint: () => {},
	onClose: () => {},
};

export default AddPoint;
