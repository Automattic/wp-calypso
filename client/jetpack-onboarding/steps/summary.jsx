/** @format */

/**
 * External dependencies
 */
import React from 'react';
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

		const siteRedirectHref = '/jetpack/onboarding/site-title';

		return (
			<div className="steps__summary">
				<DocumentHead title={ translate( 'Summary ‹ Jetpack Onboarding' ) } />
				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />
				<Button href={ siteRedirectHref } primary>
					{ translate( 'Visit your site' ) }
				</Button>
			</div>
		);
	}
}

export default localize( JetpackOnboardingSummaryStep );
