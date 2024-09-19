import config from '@automattic/calypso-config';
import { PLAN_BUSINESS, getPlan } from '@automattic/calypso-products';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import ActionCard from 'calypso/components/action-card';
import ActionPanelLink from 'calypso/components/action-panel/link';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import MainComponent from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PromoSection, { Props as PromoSectionProps } from 'calypso/components/promo-section';
import { Gridicon } from 'calypso/devdocs/design/playground-scope';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import { MarketplaceFooter } from 'calypso/my-sites/plugins/education-footer';
import { useDispatch, useSelector } from 'calypso/state';
import { appendBreadcrumb } from 'calypso/state/breadcrumb/actions';
import { getBreadcrumbs } from 'calypso/state/breadcrumb/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

const Plans = ( { intervalType }: { intervalType: 'yearly' | 'monthly' } ) => {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	const breadcrumbs = useSelector( getBreadcrumbs );
	const selectedSite = useSelector( getSelectedSite );
	const dispatch = useDispatch();

	useEffect( () => {
		if ( breadcrumbs.length === 0 ) {
			dispatch(
				appendBreadcrumb( {
					label: translate( 'Plugins' ),
					href: `/plugins/${ selectedSite?.slug || '' }`,
					id: 'plugins',
				} )
			);
		}

		dispatch(
			appendBreadcrumb( {
				label: translate( 'Plan Upgrade' ),
				href: `/plugins/plans/${ intervalType }/${ selectedSite?.slug || '' }`,
				id: `plugin-plans`,
			} )
		);
	}, [ dispatch, translate, selectedSite, breadcrumbs.length, intervalType ] );

	const promos: PromoSectionProps = {
		promos: [
			{
				title: translate( 'Flex your site with plugins' ),
				body: translate(
					'Install plugins and extend functionality for your site with access to more than 50,000 plugins.'
				),
				image: <Gridicon icon="plugins" />,
			},
			{
				title: translate( 'Money back guarantee' ),
				body: translate(
					'Try WordPress.com for 14 days and if you are not 100% satisfied, get your money back.'
				),
				image: <Gridicon icon="money" />,
			},
			{
				title: translate( 'Essential features' ),
				body: translate(
					"We guarantee site's performance and protect it from spammers detailing all activity records."
				),
				image: <Gridicon icon="plans" />,
			},
		],
	};

	return (
		<MainComponent className="plugin-plans-main" wideLayout>
			<PageViewTracker path="/plugins/plans/:interval/:site" title="Plugins > Plan Upgrade" />
			<DocumentHead title={ translate( 'Plugins > Plan Upgrade' ) } />
			<NavigationHeader
				navigationItems={ breadcrumbs }
				title={ translate( 'Plugins' ) }
				subtitle={ translate(
					'Add new functionality and integrations to your site with plugins. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
					{
						components: {
							learnMoreLink: <InlineSupportLink supportContext="plugins" showIcon={ false } />,
						},
					}
				) }
			/>

			<FormattedHeader
				className="plugin-plans-header"
				headerText={ `Your current plan doesn't support plugins` }
				subHeaderText={ `Choose the plan that's right for you and reimagine what's possible with plugins` }
				brandFont
			/>

			<div className="plans">
				<PlansFeaturesMain
					basePlansPath="/plugins/plans"
					siteId={ selectedSite?.ID }
					intervalType={ intervalType }
					selectedPlan={ PLAN_BUSINESS }
					intent="plans-plugins"
					showPlanTypeSelectorDropdown={
						/**
						 *	Override the default feature flag to prevent this feature from rendering in untested locations
						 *  The hardcoded 'false' short curicuit should be removed once the feature is fully tested in the given context
						 */
						config.isEnabled( 'onboarding/interval-dropdown' ) && false
					}
				/>
			</div>

			<PromoSection { ...promos } />

			<ActionCard
				classNames="plugin-plans"
				headerText=""
				mainText={
					hasEnTranslation(
						'Need some help? Let us help you find the perfect plan for your site. {{a}}Contact our support now{{/a}}.'
					)
						? translate(
								'Need some help? Let us help you find the perfect plan for your site. {{a}}Contact our support now{{/a}}.',
								{
									components: {
										a: <ActionPanelLink href="/help/contact" />,
									},
								}
						  )
						: translate(
								'Need some help? Let us help you find the perfect plan for your site. {{a}}Chat now{{/a}} or {{a}}contact our support{{/a}}.',
								{
									components: {
										a: <ActionPanelLink href="/help/contact" />,
									},
								}
						  )
				}
				buttonText={
					translate( 'Upgrade to %(planName)s', {
						args: { planName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '' },
					} ) as string
				}
				buttonPrimary
				buttonOnClick={ () => {
					alert( 'Connect code after merging PR 68087' );
				} }
				buttonDisabled={ false }
			/>
			<MarketplaceFooter />
		</MainComponent>
	);
};

export default Plans;
