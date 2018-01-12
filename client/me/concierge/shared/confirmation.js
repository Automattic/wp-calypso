/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormattedHeader from 'components/formatted-header';

class Confirmation extends Component {
	static propTypes = {
		buttonLabel: PropTypes.string.isRequired,
		buttonUrl: PropTypes.string.isRequired,
		description: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
	};

	render() {
		const { buttonLabel, buttonUrl, description, title } = this.props;

		return (
			<Card className="shared__confirmation">
				<img
					className="shared__confirmation-illustration"
					src={ '/calypso/images/illustrations/support.svg' }
				/>

				<FormattedHeader headerText={ title } subHeaderText={ description } />

				<Button className="shared__confirmation-button" primary={ true } href={ buttonUrl }>
					{ buttonLabel }
				</Button>
			</Card>
		);
	}
}

export default Confirmation;
