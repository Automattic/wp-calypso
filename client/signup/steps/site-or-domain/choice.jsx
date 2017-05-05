/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';

export default class SiteOrDomainChoice extends Component {
	handleClickChoice = ( event ) => {
		event.preventDefault();

		this.props.handleClickChoice( this.props.choice.type );
	}

	render() {
		const { choice } = this.props;
		return (
			<div className="site-or-domain__choice" key={ choice.type }>
				<Card compact className="site-or-domain__choice-image">
					{ choice.image }
				</Card>
				<Card compact className="site-or-domain__choice-text">
					<div className="site-or-domain__choice-button">
						<Button onClick={ this.handleClickChoice }>{ choice.label }</Button>
					</div>
					<p>{ choice.description }</p>
				</Card>
			</div>
		);
	}
}
