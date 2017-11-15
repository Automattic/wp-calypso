/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import ReaderFullPostHeader from 'blocks/reader-full-post/header';
import Card from 'components/card';

export default class ReaderFullPostHeaderExample extends React.PureComponent {
	static displayName = 'ReaderFullPostHeaderExample';

	render() {
		const post = {
			title: 'Spring Harvest 2016',
			URL: 'http://wordpress.com',
			date: '2016-07-25T00:00:00+02:00',
			tags: {
				banana: {
					name: 'Banana',
					slug: 'banana',
					display_name: 'banana',
				},
				pineapple: {
					name: 'Pineapple',
					slug: 'pineapple',
					display_name: 'pineapple',
				},
				mango: {
					name: 'Mango',
					slug: 'mango',
					display_name: 'mango',
				},
				feijoa: {
					name: 'Feijoa',
					slug: 'feijoa',
					display_name: 'feijoa',
				},
				pear: {
					name: 'Pear',
					slug: 'pear',
					display_name: 'pear',
				},
			},
		};

		return (
			<Card>
				<ReaderFullPostHeader post={ post } />
			</Card>
		);
	}
}
