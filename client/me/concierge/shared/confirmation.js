/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import FormattedHeader from 'calypso/components/formatted-header';

class Confirmation extends Component {
	static propTypes = {
		description: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
	};

	render() {
		const { children, description, title } = this.props;

		return (
			<Card className="shared__confirmation">
				<img
					className="shared__confirmation-illustration"
					src={ '/calypso/images/illustrations/support.svg' }
				/>

				<FormattedHeader headerText={ title } subHeaderText={ description } />

				{ children }
			</Card>
		);
	}
}

export default Confirmation;
