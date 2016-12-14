/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import Gridicon from 'components/gridicon';
import SectionHeader from 'components/section-header';

class EligibilityWarnings extends Component {
	static propTypes = {
		translate: PropTypes.func,
	};

	render() {
		const { translate } = this.props;

		return (
			<div className="eligibility-warnings">
				<SectionHeader label={ translate( 'Conflicts' ) } />
				<Card className="eligibility-warnings__message">
					<Gridicon icon="notice" className="eligibility-warnings__error-icon"/>
					<div className="eligibility-warnings__message-content">
						{ translate( 'Error message' ) }
					</div>
					<div className="eligibility-warnings__message-action">
						<Button> { translate( 'Resolve' ) } </Button>
					</div>
				</Card>

				<Card className="eligibility-warnings__message">
					<Gridicon icon="notice" className="eligibility-warnings__warning-icon"/>
					<div className="eligibility-warnings__message-content">
						{ translate( 'Warning message' ) }
					</div>
					<div className="eligibility-warnings__message-action">
						<Gridicon icon="help-outline" className="eligibility-warnings__warning-action"/>
					</div>
				</Card>

				<Card className="eligibility-warnings__confirm-box">
					<Gridicon icon="info-outline" className="eligibility-warnings__confirm-icon"/>
					<div className="eligibility-warnings__confirm-text">
						{ translate(
							'You must resolve the errors above before proceeding. ' +
							'Have questions? Please contact support.'
						) }
					</div>

					<div className="eligibility-warnings__buttons">
						<Button>
							{ translate( 'Cancel' ) }
						</Button>

						<Button primary={ true } disabled={ true }>
							{ translate( 'Proceed' ) }
						</Button>
					</div>

				</Card>
			</div>
		);
	}
}

export default localize( EligibilityWarnings );
