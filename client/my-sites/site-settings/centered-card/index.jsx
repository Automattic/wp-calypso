/**
 * External dependencies
 */
import React, { Component } from 'react';
/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormattedHeader from 'components/formatted-header';

class CenteredCard extends Component {
	render() {
		const { header, subheader } = this.props;

		return (
			<div>
				<FormattedHeader
					headerText={ header }
					subHeaderText={ subheader }
				/>
				<Card className="centered-card__content">
						{ this.props.children }
				</Card>
			</div>
			);
	}
}
export default CenteredCard;
