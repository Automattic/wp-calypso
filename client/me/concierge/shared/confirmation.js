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
		confirmationButton: PropTypes.string.isRequired,
		confirmationButtonUrl: PropTypes.string.isRequired,
		confirmationDescription: PropTypes.string.isRequired,
		confirmationTitle: PropTypes.string.isRequired,
	};

	render() {
		const {
			confirmationButton,
			confirmationButtonUrl,
			confirmationDescription,
			confirmationTitle,
		} = this.props;

		return (
			<Card className="shared__confirmation">
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
					href={ confirmationButtonUrl }
				>
					{ confirmationButton }
				</Button>
			</Card>
		);
	}
}

export default Confirmation;
