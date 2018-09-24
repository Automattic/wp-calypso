/**
 * External dependencies
 */
import { TextControl, PanelBody, Panel } from '@wordpress/components';
import { Component } from '@wordpress/element';
import { clone } from 'lodash';

/**
 * Internal dependencies
 */

import './Locations.scss';
import LocationSearch from './LocationSearch.js';

export class Locations extends Component {
	constructor() {
		super( ...arguments );
		this.commitPoint = this.commitPoint.bind(this);
		this.state = {
			selectedCell: null
		};
	}
	addPoint( point ) {
		const newPoints = clone( this.props.points );
		newPoints.push(point);
		this.props.onChange( newPoints );
	}
	deletePointAtIndex( index ) {
		const newPoints = clone( this.props.points );
		newPoints.splice( parseInt( index ), 1 );
		this.props.onChange( newPoints );
	}
	onDeletePoint( e ) {
		const index = e.target.getAttribute( 'data-id' );
		this.deletePointAtIndex( index );
	}
	commitPoint( point ) {
		this.addPoint( point )
	}
	setMarkerField( field, value, index ) {
		const newPoints = clone( this.props.points );
		newPoints[index][field] = value;
		this.props.onChange( newPoints );
	}
	render() {
		const { points } = this.props;
		const rows = points.map( ( point, index ) =>
			<PanelBody title={ point.place_title } key={ point.place_id } initialOpen={ false }>
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
  				<button data-id={ index } onClick={ this.onDeletePoint.bind(this) }>Delete Point</button>
  			</PanelBody>
		);
    	return (
        	<div className='components-locations'>
            	<LocationSearch CommitPoint={ this.commitPoint } />
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
