import { FEATURE_INSTALL_PLUGINS, PLAN_BUSINESS } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import FormattedHeader from 'calypso/components/formatted-header';
import MainComponent from 'calypso/components/main';
import { Gridicon } from 'calypso/devdocs/design/playground-scope';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import { appendBreadcrumb } from 'calypso/state/breadcrumb/actions';
import { getBreadcrumbs } from 'calypso/state/breadcrumb/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

const Plans = ( { intervalType }: { intervalType: 'yearly' | 'monthly' } ) => {
	const translate = useTranslate();
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
					helpBubble: translate(
						'Add new functionality and integrations to your site with plugins.'
					),
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

	return (
		<MainComponent wideLayout>
			<PageViewTracker path="/plugins/plans/:interval/:site" title="Plugins > Plan Upgrade" />
			<DocumentHead title={ translate( 'Plugins > Plan Upgrade' ) } />
			<FixedNavigationHeader navigationItems={ breadcrumbs } />
			<FormattedHeader
				className="plugin-plans-header"
				headerText={ `Your current plan doesn't support plugins` }
				subHeaderText={ `Choose the plan that's right for you and reimagine what's possible with plugins` }
				brandFont
			/>

			<div className="plans">
				<PlansFeaturesMain
					basePlansPath="/plugins/plans"
					site={ selectedSite }
					intervalType={ intervalType }
					selectedFeature={ FEATURE_INSTALL_PLUGINS }
					selectedPlan={ PLAN_BUSINESS }
					shouldShowPlansFeatureComparison
					isReskinned
				/>
			</div>

			<div className="plugin-plans-step-hints">
				<section>
					<Gridicon icon="plugins" />
					<h3>{ translate( 'Flex your site with plugins' ) }</h3>
					<p>
						{ translate(
							'Install plugins and extend functionality for your site with access to more than 50,000 plugins.'
						) }
					</p>
				</section>
				<section>
					<Gridicon icon="money" />
					<h3>{ translate( 'Money back guarantee' ) }</h3>
					<p>
						{ translate(
							'Try WordPress.com for 14 days and if you are not 100% satisfied, get your money back.'
						) }
					</p>
				</section>
				<section>
					<Gridicon icon="plans" />
					<h3>{ translate( 'Essential features' ) }</h3>
					<p>
						{ translate(
							"We guarantee site's performance and protect it from spammers detailing all activity records."
						) }
					</p>
				</section>
			</div>
		</MainComponent>
	);
};

export default Plans;
