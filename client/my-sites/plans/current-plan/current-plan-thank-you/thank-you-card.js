/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import { preventWidows } from 'lib/formatting';
import Button from 'components/button';

import './style.scss';

export function ThankYouCard( {
	children,
	illustration,
	showCalypsoIntro,
	showContinueButton,
	showHideMessage,
	siteSlug,
	title,
	translate,
} ) {
	return (
		<div className="current-plan-thank-you">
			{ illustration && (
				<img
					alt=""
					aria-hidden="true"
					className="current-plan-thank-you__illustration"
					src={ illustration }
				/>
			) }
			{ title && <h1 className="current-plan-thank-you__title">{ title }</h1> }
			{ children }
			{ showCalypsoIntro && (
				<p>
					{ preventWidows(
						translate(
							'This is your new WordPress.com dashboard. You can manage your site ' +
								'here, or return to your self-hosted WordPress dashboard using the ' +
								'link at the bottom of your checklist.'
						)
					) }
				</p>
			) }
			{ showContinueButton && (
				<Button primary href={ `/plans/my-plan/${ siteSlug }` }>
					{ translate( 'Continue' ) }
				</Button>
			) }
			{ showHideMessage && (
				<p>
					<a href={ `/plans/my-plan/${ siteSlug }` }>{ translate( 'Hide message' ) }</a>
				</p>
			) }
		</div>
	);
}

export default connect( state => {
	return {
		siteSlug: getSelectedSiteSlug( state ),
	};
} )( localize( ThankYouCard ) );
