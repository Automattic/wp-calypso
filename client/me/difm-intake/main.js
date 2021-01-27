/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import { localize } from 'i18n-calypso';
import { Card } from '@automattic/components';
import FormattedHeader from 'calypso/components/formatted-header';
import ExternalLink from 'calypso/components/external-link';

/**
 * Style dependencies
 */
import './style.scss';

class DifmIntake extends Component {
	renderHeader() {
		const { translate } = this.props;

		return (
			<Fragment>
				<Card>
					<img
						className="difm-intake__info-illustration"
						alt="support session signup form header"
						src={ '/calypso/images/illustrations/illustration-start.svg' }
					/>
					<FormattedHeader
						headerText={ translate( 'WordPress.com "Built for you" application form' ) }
						subHeaderText={ translate(
							'Fill out the form below to apply for your "Built for you" program.'
						) }
					/>
					<ExternalLink
						className="difm-intake__info-link"
						icon={ false }
						href={ 'https://wordpress.com/built-by-wordpress-com/' }
						target="_blank"
					>
						{ translate( 'Learn more' ) }
					</ExternalLink>
				</Card>
			</Fragment>
		);
	}

	renderSurvey() {
		return (
			<div className="difm-intake__survey">
				<iframe
					title="DIFM intake survey"
					scrolling="auto"
					width="100%"
					allowtransparency="true"
					src="https://automattic.survey.fm/site-builder-intake-survey-upsell-version?iframe=1"
				>
					<a href="https://automattic.survey.fm/site-builder-intake-survey-upsell-version">
						View Survey
					</a>
				</iframe>
			</div>
		);
	}

	render() {
		return (
			<Main>
				<div>
					{ this.renderHeader() }
					{ this.renderSurvey() }
				</div>
			</Main>
		);
	}
}

export default localize( DifmIntake );
