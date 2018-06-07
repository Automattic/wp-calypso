/** @format */

/**
 * Internal dependencies
 */
import makeEmitter from 'lib/mixins/emitter';

/**
 * @see client/lib/countries-list
 */
function CountriesList() {
	this.list = [];

	this.clear = () => {
		this.list = [];

		this.emit( 'change' );
	};

	this.fetch = () => {
		this.list = [
			{
				code: 'US',
				name: 'United States (+1)',
				numeric_code: '+1',
				country_name: 'United States',
			},
			{
				code: 'AR',
				name: 'Argentina (+54)',
				numeric_code: '+54',
				country_name: 'Argentina',
			},
		];

		this.emit( 'change' );
	};

	this.get = () => {
		return this.list;
	};
}

makeEmitter( CountriesList.prototype );

export default CountriesList;
