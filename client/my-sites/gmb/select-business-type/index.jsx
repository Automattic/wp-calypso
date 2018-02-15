/**
 * External dependencies
 *
 * @format
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import Card from 'components/card';

export default class GMBSelectBusinessType extends Component {
	render() {
		return (
			<div>
				<HeaderCake isCompact={ false } alwaysShowActionText={ false }>
					Google My Business
				</HeaderCake>
				<Card>
					<h1>Which type of business are you?</h1>
					<h2>Listings on Google My Business are best for businesses that serve local area.</h2>
				</Card>

				<Card>
					<h2>Storefront</h2>
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
						incididunt ut labore et dolore magna aliqua.
					</p>
				</Card>

				<Card>
					<h2>Service Area</h2>
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
						incididunt ut labore et dolore magna aliqua.
					</p>{' '}
				</Card>
				<Card>
					<h2>Online Only</h2>
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
						incididunt ut labore et dolore magna aliqua.
					</p>
				</Card>
			</div>
		);
	}
}
