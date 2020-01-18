/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import FormattedHeader from 'components/formatted-header';

/**
 * Image dependencies
 */
import supportIllustration from 'assets/images/illustrations/happiness-support.svg';

class Confirmation extends Component {
	static propTypes = {
		description: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
	};

	render() {
		const { children, description, title } = this.props;

		return (
			<Card className="shared__confirmation">
				<img className="shared__confirmation-illustration" src={ supportIllustration } alt="" />

				<FormattedHeader headerText={ title } subHeaderText={ description } />

				{ children }
			</Card>
		);
	}
}

export default Confirmation;
