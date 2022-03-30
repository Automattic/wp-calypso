import { isEnabled } from '@automattic/calypso-config';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import { isEligibleForProPlan } from 'calypso/my-sites/plans-comparison';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

class ReskinSideExplainer extends Component {
	getStrings() {
		const { type, eligibleForProPlan, selectedSiteId, translate } = this.props;

		let title;
		let subtitle;
		let ctaText;

		// The special case latter is for handling the case in the sign-up flow.
		// By that time, a site is not available yet, so we can only check the feature flag for now
		const shouldShowProPlanTitle =
			eligibleForProPlan || ( selectedSiteId == null && isEnabled( 'plans/pro-plan' ) );

		switch ( type ) {
			case 'free-domain-explainer':
				title = shouldShowProPlanTitle
					? translate(
							'Get a {{b}}free{{/b}} one-year domain registration with your WordPress Pro annual plan.',
							{
								components: { b: <strong /> },
							}
					  )
					: translate(
							'Get a {{b}}free{{/b}} one-year domain registration with any paid annual plan.',
							{
								components: { b: <strong /> },
							}
					  );

				subtitle = translate(
					"You can claim your free custom domain later if you aren't ready yet."
				);
				ctaText = translate( 'Choose my domain later' );
				break;

			case 'use-your-domain':
				title = translate( 'Already own a domain?' );
				subtitle = translate(
					'Connect your domain purchased elsewhere to your WordPress.com site through mapping or transfer.'
				);
				ctaText = translate( 'Use a domain I own' );
				break;

			case 'free-domain-only-explainer':
				title = translate(
					'Get a {{b}}free{{/b}} one-year domain registration with any paid annual plan.',
					{
						components: { b: <strong /> },
					}
				);
				subtitle = translate(
					'You can also choose to just start with a domain and add a site with a plan later on.'
				);
				break;
		}

		return { title, subtitle, ctaText };
	}

	render() {
		const { title, subtitle, ctaText } = this.getStrings();

		return (
			/* eslint-disable jsx-a11y/click-events-have-key-events */
			<div className="reskin-side-explainer">
				<div className="reskin-side-explainer__title">{ title }</div>
				<div className="reskin-side-explainer__subtitle">{ subtitle }</div>
				{ ctaText && (
					<div className="reskin-side-explainer__cta">
						<span
							className="reskin-side-explainer__cta-text"
							role="button"
							onClick={ this.props.onClick }
							tabIndex="0"
						>
							{ ctaText }
						</span>
					</div>
				) }
			</div>
			/* eslint-enable jsx-a11y/click-events-have-key-events */
		);
	}
}

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );

	return {
		selectedSiteId,
		eligibleForProPlan: isEligibleForProPlan( state, selectedSiteId ),
	};
} )( localize( ReskinSideExplainer ) );
