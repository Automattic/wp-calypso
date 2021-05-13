/**
 * External dependencies
 */

import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';

export default class SiteOrDomainChoice extends Component {
	handleClickChoice = ( event ) => {
		event.preventDefault();

		this.props.handleClickChoice( this.props.choice.type );
	};

	render() {
		const { choice, isPlaceholder } = this.props;

		if ( isPlaceholder ) {
			return (
				<div
					className="site-or-domain__choice site-or-domain__choice-is-placeholder"
					key={ choice.type }
				>
					<Card compact className="site-or-domain__choice-image site-or-domain__is-placeholder" />
					<Card compact className="site-or-domain__choice-text">
						<div className="site-or-domain__choice-button">
							<Button className="site-or-domain__is-placeholder" />
						</div>
						<p className="site-or-domain__is-placeholder" />
					</Card>
				</div>
			);
		}

		return (
			<div className="site-or-domain__choice" data-e2e-type={ choice.type } key={ choice.type }>
				<a className="site-or-domain__choice-link" onClick={ this.handleClickChoice }>
					<Card compact className="site-or-domain__choice-image">
						{ choice.image }
					</Card>
					<Card compact className="site-or-domain__choice-text">
						<div className="site-or-domain__choice-button">
							<Button>{ choice.label }</Button>
						</div>
						<p>{ choice.description }</p>
					</Card>
				</a>
			</div>
		);
	}
}
