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
		isEligible: PropTypes.bool.isRequired,
		errors: PropTypes.arrayOf(
			PropTypes.shape( {
				title: PropTypes.string,
				description: PropTypes.string,
				actionUrl: PropTypes.string,
			} )
		),
		pluginWarnings: PropTypes.arrayOf(
			PropTypes.shape( {
				title: PropTypes.string,
				description: PropTypes.string,
				actionUrl: PropTypes.string,
			} )
		),
		widgetWarnings: PropTypes.arrayOf(
			PropTypes.shape( {
				title: PropTypes.string,
				description: PropTypes.string,
				actionUrl: PropTypes.string,
			} )
		),
		backUrl: PropTypes.string,
		translate: PropTypes.func,
	};

	render() {
		const {
			translate,
			backUrl,
			isEligible,
			errors,
			pluginWarnings,
			widgetWarnings,
		} = this.props;

		return (
			<div className="eligibility-warnings">
				<SectionHeader label={ translate( 'Conflicts' ) } />

				{ errors.map( ( message ) =>
					<Card key={ message.title } className="eligibility-warnings__message">
						<Gridicon icon="notice" className="eligibility-warnings__error-icon" />
						<div className="eligibility-warnings__message-content">
							<div className="eligibility-warnings__message-title">
								{ translate( 'Error' ) + `: ${ message.title }` }
							</div>
							<div className="eligibility-warnings__message-description">
								{ message.description }
							</div>
						</div>
						<div className="eligibility-warnings__message-action">
							<Button href={ message.actionUrl } target="_blank" rel="noopener noreferrer">
								{ translate( 'Resolve' ) }
							</Button>
						</div>
					</Card>
				) }

				{ pluginWarnings.map( ( message ) =>
					<Card key={ message.title } className="eligibility-warnings__message">
						<Gridicon icon="notice" className="eligibility-warnings__warning-icon" />
						<div className="eligibility-warnings__message-content">
							<div className="eligibility-warnings__message-title">
								{ translate( 'Unsupported feature' ) + `: ${ message.title }` }
							</div>
							<div className="eligibility-warnings__message-description">
								{ message.description }
							</div>
						</div>
						<div className="eligibility-warnings__message-action">
							<a href={ message.actionUrl } target="_blank" rel="noopener noreferrer">
								<Gridicon icon="help-outline" className="eligibility-warnings__warning-action" />
							</a>
						</div>
					</Card>
				) }

				{ widgetWarnings.map( ( message ) =>
					<Card key={ message.title } className="eligibility-warnings__message">
						<Gridicon icon="notice" className="eligibility-warnings__warning-icon" />
						<div className="eligibility-warnings__message-content">
							<div className="eligibility-warnings__message-title">
								{ translate( 'Incompatible widget' ) + `: ${ message.title }` }
							</div>
							<div className="eligibility-warnings__message-description">
								{ message.description }
							</div>
						</div>
						<div className="eligibility-warnings__message-action">
							<a href={ message.actionUrl } target="_blank" rel="noopener noreferrer">
								<Gridicon icon="help-outline" className="eligibility-warnings__warning-action" />
							</a>
						</div>
					</Card>
				) }

				<Card className="eligibility-warnings__confirm-box">
					<Gridicon icon="info-outline" className="eligibility-warnings__confirm-icon" />
					<div className="eligibility-warnings__confirm-text">
						{ ! isEligible && translate(
							'You must resolve the errors above before proceeding. '
						) }
						{ isEligible && translate(
							'By proceeding you understand that you will loose these features. '
						) }
						{ translate( 'Have questions? Please contact support.' ) }
					</div>

					<div className="eligibility-warnings__buttons">
						<Button href={ backUrl }>
							{ translate( 'Cancel' ) }
						</Button>

						<Button primary={ true } disabled={ ! isEligible }>
							{ translate( 'Proceed' ) }
						</Button>
					</div>

				</Card>
			</div>
		);
	}
}

export default localize( EligibilityWarnings );
