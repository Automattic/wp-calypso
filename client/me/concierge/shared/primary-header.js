/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormattedHeader from 'components/formatted-header';
import ExternalLink from 'components/external-link';
import { CONCIERGE_SUPPORT } from 'lib/url/support';

class PrimaryHeader extends Component {
	render() {
		return (
			<Card>
				<img
					className="shared__info-illustration"
					alt="concierge session signup form header"
					src={ '/calypso/images/illustrations/illustration-start.svg' }
				/>
				<FormattedHeader
					headerText={ 'WordPress.com Business Concierge Session' }
					subHeaderText={ "In this 30-minute session we'll help you get started with your site." }
				/>
				<ExternalLink
					className="shared__info-link"
					icon={ false }
					href={ CONCIERGE_SUPPORT }
					target="_blank"
				>
					{ 'Learn more' }
				</ExternalLink>
			</Card>
		);
	}
}

export default PrimaryHeader;
