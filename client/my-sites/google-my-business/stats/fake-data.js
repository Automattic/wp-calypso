/** @format */

/**
 * External dependencies
 */
import { random, range } from 'lodash';
import { translate } from 'i18n-calypso';

const dataSummer = ( prevResult, datum ) => prevResult + datum.value;

const searchData = [
	{
		name: translate( 'Direct' ),
		description: translate(
			'Customers who find your listing searching for you business name or address'
		),
		value: random( 300, 500 ),
	},
	{
		name: translate( 'Discovery' ),
		description: translate(
			'Customers who find your listing searching for a category, product, or service'
		),
		value: random( 200, 400 ),
	},
];

const searchDataTotal = searchData.reduce( dataSummer, 0 );

const viewData = range( 19, 30 ).map( day => ( {
	value: random( 10, 90 ),
	nestedValue: random( 5, 80 ),
	label: `Mar ${ day }`,
} ) );

const actionData = range( 19, 30 ).map( day => ( {
	value: random( 10, 90 ),
	nestedValue: random( 5, 80 ),
	label: `Mar ${ day }`,
} ) );

const locationData = {
	id: 12345,
	address: [
		'Centre Commercial Cap 3000',
		'Avenue Eugene Donadei',
		'06700 Saint-Laurent-du-Var',
		'France',
	],
	name: 'Starbucks',
	photo: 'http://www.shantee.net/wp-content/uploads/2016/02/cookies-internet-1030x684.jpg',
	verified: true,
};

export default {
	actionData,
	locationData,
	searchData,
	searchDataTotal,
	viewData,
};
