/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormattedHeader from 'components/formatted-header';

class Confirmation extends Component {
	render() {
		const { site, confirmationButton, confirmationDescription, confirmationTitle } = this.props;

		return (
			<Card>
				<img
					className="shared__confirmation-illustration"
					src={ '/calypso/images/illustrations/support.svg' }
				/>

				<FormattedHeader
					headerText={ confirmationTitle }
					subHeaderText={ confirmationDescription }
				/>

				<Button
					className="shared__confirmation-button"
					primary={ true }
					href={ `/stats/day/${ site.slug }` }
				>
					{ confirmationButton }
				</Button>
			</Card>
		);
	}
}

export default Confirmation;
