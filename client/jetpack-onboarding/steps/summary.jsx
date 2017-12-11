/** @format */

/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';

class JetpackOnboardingSummaryStep extends React.PureComponent {
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
