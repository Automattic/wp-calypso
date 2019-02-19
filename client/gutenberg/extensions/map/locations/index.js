/**
 * External dependencies
 */
import {
	Button,
	Dashicon,
	Panel,
	PanelBody,
	TextareaControl,
	TextControl,
} from '@wordpress/components';
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './style.scss';

export class Locations extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			selectedCell: null,
		};
	}

	onDeletePoint = e => {
		const index = parseInt( e.target.getAttribute( 'data-id' ) );
		const { points, onChange } = this.props;

		const newPoints = points.slice( 0 );
		newPoints.splice( index, 1 );
		onChange( newPoints );
	};

	setMarkerField( field, value, index ) {
		const { points, onChange } = this.props;

		const newPoints = points.slice( 0 );
		newPoints[ index ][ field ] = value;
		onChange( newPoints );
	}

	render() {
		const { points } = this.props;
		const rows = points.map( ( point, index ) => (
			<PanelBody title={ point.placeTitle } key={ point.id } initialOpen={ false }>
				<TextControl
					label="Marker Title"
					value={ point.title }
					onChange={ title => this.setMarkerField( 'title', title, index ) }
				/>
				<TextareaControl
					label="Marker Caption"
					value={ point.caption }
					rows="3"
					onChange={ caption => this.setMarkerField( 'caption', caption, index ) }
				/>
				<Button
					data-id={ index }
					onClick={ this.onDeletePoint }
					className="component__locations__delete-btn"
				>
					<Dashicon icon="trash" size="15" /> Delete Marker
				</Button>
			</PanelBody>
		) );
		return (
			<div className="component__locations">
				<Panel className="component__locations__panel">{ rows }</Panel>
			</div>
		);
	}
}

Locations.defaultProps = {
	points: Object.freeze( [] ),
	onChange: () => {},
};

export default Locations;
