import i18n, { getLocaleSlug, localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import { isStarterPlanEnabled } from 'calypso/my-sites/plans-comparison';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

class ReskinSideExplainer extends Component {
	getStarterPlanOverrides( isEnLocale ) {
		const { translate } = this.props;

		const fallbackTitle = translate(
			'Get a free one-year domain registration with any paid plan.'
		);

		const isPaidPlan = [ 'starter', 'pro' ].includes( this.props.flowName );
		const hasFreeTitle =
			i18n.hasTranslation(
				'Get a {{b}}free{{/b}} one-year domain registration with any paid plan.'
			) || isEnLocale;

		const freeTitle = hasFreeTitle
			? translate( 'Get a {{b}}free{{/b}} one-year domain registration with any paid plan.', {
					components: { b: <strong /> },
			  } )
			: fallbackTitle;

		const hasPaidTitle =
			i18n.hasTranslation( 'Get a {{b}}free{{/b}} one-year domain registration with your plan.' ) ||
			isEnLocale;

		const paidTitle = hasPaidTitle
			? translate( 'Get a {{b}}free{{/b}} one-year domain registration with your plan.', {
					components: { b: <strong /> },
			  } )
			: fallbackTitle;

		const title = isPaidPlan ? paidTitle : freeTitle;

		const hasFreeSubtitle =
			i18n.hasTranslation(
				'Use the search tool on this page to find a domain you love, then select a paid plan.'
			) || isEnLocale;

		const freeSubtitle =
			hasFreeSubtitle &&
			translate(
				'Use the search tool on this page to find a domain you love, then select a paid plan.'
			);

		const paidSubtitle = translate( 'Use the search tool on this page to find a domain you love.' );

		let subtitle = isPaidPlan ? paidSubtitle : freeSubtitle;

		let subtitle2 = translate(
			'We’ll pay the first year’s domain registration fees for you, simple as that!'
		);

		if ( ! subtitle ) {
			subtitle = subtitle2;
			subtitle2 = null;
		}
		return { title, subtitle, subtitle2, ctaText: false };
	}
	getStrings() {
		const { type, translate } = this.props;

		let title;
		let subtitle;
		let subtitle2;
		let ctaText;

		const isEnLocale = [ 'en', 'en-gb' ].includes( getLocaleSlug() );
		const showNewTitle =
			i18n.hasTranslation( 'Get your domain {{b}}free{{/b}} with WordPress Pro' ) || isEnLocale;

		const showNewSubtitle =
			i18n.hasTranslation(
				'Use the search tool on this page to find a domain you love, then select the {{b}}WordPress Pro{{/b}} plan.'
			) || isEnLocale;

		const newSubtitleCopy =
			'pro' === this.props.flowName
				? translate( 'Use the search tool on this page to find a domain you love.' )
				: translate(
						'Use the search tool on this page to find a domain you love, then select the {{b}}WordPress Pro{{/b}} plan.',
						{
							components: { b: <strong /> },
						}
				  );

		switch ( type ) {
			case 'free-domain-explainer':
				title = showNewTitle
					? translate( 'Get your domain {{b}}free{{/b}} with WordPress Pro', {
							components: { b: <strong /> },
					  } )
					: translate(
							'Get a {{b}}free{{/b}} one-year domain registration with your WordPress Pro annual plan.',
							{
								components: { b: <strong /> },
							}
					  );

				subtitle = showNewSubtitle
					? newSubtitleCopy
					: translate( "You can claim your free custom domain later if you aren't ready yet." );

				subtitle2 =
					showNewSubtitle &&
					translate(
						'We’ll pay the first year’s domain registration fees for you, simple as that!'
					);
				ctaText = ! showNewSubtitle && translate( 'Choose my domain later' );

				//todo: use only getStarterPlanOverrides() after Starter plan deploy
				if ( isStarterPlanEnabled() ) {
					const overrides = this.getStarterPlanOverrides( isEnLocale );
					title = overrides.title;
					subtitle = overrides.subtitle;
					subtitle2 = overrides.subtitle2;
					ctaText = overrides.ctaText;
				}

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
	};
} )( localize( ReskinSideExplainer ) );
