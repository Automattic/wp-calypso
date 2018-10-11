/**
 * Wordpress dependencies
 */

import {
	Panel,
	PanelBody,
	TextControl
} from '@wordpress/components';

import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */

import './style.scss';

/**
 * External dependencies
 */

import {
	clone,
	concat
} from 'lodash';

export class Locations extends Component {

	constructor() {
		super( ...arguments );
		this.onDeletePoint = this.onDeletePoint.bind(this);
		this.state = {
			selectedCell: null
		};
	}

	onDeletePoint( e ) {
		const index = parseInt( e.target.getAttribute( 'data-id' ) );
		const { points, onChange } = this.props;
		let newPoints = clone( points );
		newPoints.splice( index, 1 );
		onChange( newPoints );
	}

	setMarkerField( field, value, index ) {
		const { points, onChange } = this.props;
		let newPoints = clone( points );
		newPoints[index][field] = value;
		onChange( newPoints );
	}

	render() {
		const { points } = this.props;
		const rows = points.map( ( point, index ) =>
			<PanelBody title={ point.place_title } key={ point.place_id } initialOpen={ false } key={ index }>
				<TextControl
					label="Marker Title"
					value={ point.title }
					onChange={ ( title ) => this.setMarkerField( 'title', title, index ) }
				/>
				<TextControl
					label="Marker Caption"
					value={ point.caption }
					onChange={ ( caption ) => this.setMarkerField( 'caption', caption, index ) }
				/>
				<button
					data-id={ index }
					onClick={ this.onDeletePoint }
				>Delete Point</button>
			</PanelBody>
		);
		return (
			<div className='components-locations'>
				<Panel className='components-locations__panel'>
					{ rows }
				</Panel>
			</div>
		);
	}
}

Locations.defaultProps = {
	points: Object.freeze( [] ),
	onChange: () => {}
};

export default Locations;
