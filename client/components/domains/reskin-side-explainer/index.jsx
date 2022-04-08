import i18n, { getLocaleSlug, localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import { isEligibleForProPlan } from 'calypso/my-sites/plans-comparison';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

class ReskinSideExplainer extends Component {
	getStrings() {
		const { type, translate } = this.props;

		let title;
		let subtitle;
		let ctaText;

		const showNewTitle =
			i18n.hasTranslation( 'Your domain is {{b}}free{{/b}} with WordPress Pro' ) ||
			'en' === getLocaleSlug();

		const showNewSubtitle =
			i18n.hasTranslation(
				'Use the search tool on this page to find a domain you love, then select the {{b}}WordPress Pro{{/b}} plan.{{br}}{{br}}We’ll pay the first year’s domain registration fees for you, simple as that!'
			) || 'en' === getLocaleSlug();

		switch ( type ) {
			case 'free-domain-explainer':
				showNewTitle
					? ( title = translate( 'Get your domain {{b}}free{{/b}} with WordPress Pro', {
							components: { b: <strong /> },
					  } ) )
					: ( title = translate(
							'Get a {{b}}free{{/b}} one-year domain registration with your WordPress Pro annual plan.',
							{
								components: { b: <strong /> },
							}
					  ) );

				showNewSubtitle
					? ( subtitle = translate(
							'Use the search tool on this page to find a domain you love, then select the {{b}}WordPress Pro{{/b}} plan.{{br /}}{{br /}}We’ll pay the first year’s domain registration fees for you, simple as that!',
							{
								components: { b: <strong />, br: <br /> },
							}
					  ) )
					: ( subtitle = translate(
							"You can claim your free custom domain later if you aren't ready yet."
					  ) );
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
