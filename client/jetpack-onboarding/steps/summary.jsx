/** @format */

/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';

class JetpackOnboardingSummaryStep extends React.PureComponent {
	renderCompleted = () => {
		const { translate } = this.props;
		const stepsCompleted = [
			translate( 'Site Title & Description' ),
			translate( 'Type of Site' ),
			translate( 'Type of Homepage' ),
			translate( 'Contact Us Form' ),
			translate( 'Jetpack Connection' ),
		];

		return map( stepsCompleted, ( fieldLabel, fieldIndex ) => (
			<div key={ fieldIndex } className="steps__summary-entry completed">
				<Gridicon icon="checkmark" size={ 18 } />
				{ fieldLabel }
			</div>
		) );
	};

	renderTodo = () => {
		const { translate } = this.props;
		const stepsTodo = [
			translate( 'Choose a Theme' ),
			translate( 'Add a Site Address' ),
			translate( 'Add a Store' ),
			translate( 'Start a Blog' ),
		];

		// TODO: adapt when we have more info + it will differ for different steps
		const siteRedirectHref = '#';

		return map( stepsTodo, ( fieldLabel, fieldIndex ) => (
			<div key={ fieldIndex } className="steps__summary-entry todo">
				<a href={ siteRedirectHref }>{ fieldLabel }</a>
			</div>
		) );
	};

	render() {
		const { translate } = this.props;
		const headerText = translate( 'Congratulations! Your site is on its way.' );
		const subHeaderText = translate(
			'You enabled Jetpack and unlocked dozens of website-bolstering features. Continue preparing your site below.'
		);

		// TODO: adapt when we have more info
		const buttonRedirectHref = '#';

		return (
			<Fragment>
				<DocumentHead title={ translate( 'Summary ‹ Jetpack Onboarding' ) } />
				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />

				<div className="steps__summary-columns">
					<div className="steps__summary-column">
						<h3 className="steps__summary-heading">{ translate( "Steps you've completed:" ) }</h3>
						{ this.renderCompleted() }
					</div>
					<div className="steps__summary-column">
						<h3 className="steps__summary-heading">{ translate( 'Continue your site setup:' ) }</h3>
						{ this.renderTodo() }
					</div>
				</div>
				<div className="steps__button-group">
					<Button href={ buttonRedirectHref } primary>
						{ translate( 'Visit your site' ) }
					</Button>
				</div>
			</Fragment>
		);
	}
}

export default localize( JetpackOnboardingSummaryStep );
