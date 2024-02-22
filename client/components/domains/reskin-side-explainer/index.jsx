import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

class ReskinSideExplainer extends Component {
	getStrings() {
		const { flowName, translate, type } = this.props;

		let title;
		let freeTitle;
		let paidTitle;
		let subtitle;
		let freeSubtitle;
		let paidSubtitle;
		let subtitle2;
		let ctaText;

		const isPaidPlan = [
			'starter',
			'pro',
			'personal',
			'premium',
			'business',
			'ecommerce',
			'domain',
		].includes( flowName );

		const hideChooseDomainLater = [ 'launch-site', 'onboarding-with-email' ].includes( flowName );

		switch ( type ) {
			case 'free-domain-explainer':
				freeTitle = translate(
					'Get a {{b}}free{{/b}} one-year domain registration with any paid annual plan.',
					{
						components: { b: <strong /> },
					}
				);

				paidTitle = translate(
					'Get a {{b}}free{{/b}} one-year domain registration with your plan.',
					{
						components: { b: <strong /> },
					}
				);

				title = isPaidPlan ? paidTitle : freeTitle;

				freeSubtitle = (
					<span>
						{ translate(
							'Use the search tool on this page to find a domain you love, then select any paid annual plan.'
						) }
					</span>
				);

				paidSubtitle = translate( 'Use the search tool on this page to find a domain you love.' );

				subtitle = isPaidPlan ? paidSubtitle : freeSubtitle;

				subtitle2 = translate(
					'We’ll pay the first year’s domain registration fees for you, simple as that!'
				);

				if ( ! subtitle ) {
					subtitle = subtitle2;
					subtitle2 = null;
				}

				ctaText = hideChooseDomainLater ? null : (
					<span>{ translate( 'Choose my domain later' ) }</span>
				);
				break;
			case 'free-domain-explainer-check-paid-plans':
				title = translate( 'Not ready to choose a domain just yet?' );
				subtitle = translate(
					'Select any annual paid plan and we’ll pay the first year’s domain registration fees for you.'
				);
				subtitle2 = translate( 'You can claim your custom domain name later when you’re ready.' );
				ctaText = translate( 'Check paid plans »' );
				break;

			case 'free-domain-explainer-treatment-search':
				title = translate( 'Get a free domain with select paid plans' );
				subtitle = translate(
					'Select any annual paid plan and we’ll pay the first year’s domain registration fees for you.'
				);
				subtitle2 = translate(
					'Not ready to choose domain yet? Get your plan now and claim your domain later!'
				);
				ctaText = translate( 'Check paid plans »' );
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

		return { title, subtitle, subtitle2, ctaText };
	}

	render() {
		const { title, subtitle, subtitle2, ctaText } = this.getStrings();

		return (
			/* eslint-disable jsx-a11y/click-events-have-key-events */
			<div className="reskin-side-explainer">
				<div className="reskin-side-explainer__title">{ title }</div>
				<div className="reskin-side-explainer__subtitle">
					<div>{ subtitle }</div>
					{ subtitle2 && <div className="reskin-side-explainer__subtitle-2">{ subtitle2 }</div> }
				</div>
				{ ctaText && (
					<div className="reskin-side-explainer__cta">
						<button
							className="reskin-side-explainer__cta-text"
							onClick={ this.props.onClick }
							tabIndex="0"
						>
							{ ctaText }
						</button>
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
	};
} )( localize( ReskinSideExplainer ) );
