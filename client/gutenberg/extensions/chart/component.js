/**
 * External dependencies
 */

import {
	Component,
	Fragment,
} from '@wordpress/element';

/**
 * Internal dependencies
 */

 import { loadScript } from './load-script';

export class Chart extends Component {
	constructor() {
		super( ...arguments );
		this.state = {};
	}
	componentDidMount() {
		this.loadMultipleLibraries( [
			'https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.min.js',
			'https://cdnjs.cloudflare.com/ajax/libs/c3/0.4.10/c3.min.js',
		], this.initialize );
	}
	loadMultipleLibraries( libraries, callback ) {
		const status = [];
		libraries.forEach( ( library ) => {
			status.push( library );
			loadScript( library, error => {
				if ( error ) {
					return;
				}
				status.splice( 0, 1 );
				if ( status.length === 0 ) {
					callback();
				}
			} );
		} );
	}
	initialize = () => {

	}
	render() {
		const {
			googlesheet_url,
			x_axis_label,
			y_axis_label,
			chart_type,
			number_format,
		} = this.props;
		return (
			<Fragment>
				<p>Hello Component</p>
				<p>googlesheet_url: { googlesheet_url }</p>
				<p>x_axis_label: { x_axis_label }</p>
				<p>y_axis_label: { y_axis_label }</p>
				<p>chart_type: { chart_type }</p>
				<p>number_format: { number_format }</p>
			</Fragment>
		);
	}
}

Chart.defaultProps = {
	googlesheet_url: '',
	x_axis_label: '',
	y_axis_label: '',
	chart_type: '',
	number_format: '',
};

export default Chart;
