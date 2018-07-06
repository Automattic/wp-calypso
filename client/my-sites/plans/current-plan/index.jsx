/** @format */

/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Main from 'components/main';
import {
	getCurrentPlan,
	isCurrentPlanExpiring,
	isRequestingSitePlans,
} from 'state/sites/plans/selectors';
import { isFreeJetpackPlan } from 'lib/products-values';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import DocumentHead from 'components/data/document-head';
import TrackComponentView from 'lib/analytics/track-component-view';
import PlansNavigation from 'my-sites/domains/navigation';
import ProductPurchaseFeaturesList from 'blocks/product-purchase-features-list';
import CurrentPlanHeader from './header';
import QuerySites from 'components/data/query-sites';
import QuerySitePlans from 'components/data/query-site-plans';
import { getPlan } from 'lib/plans';
import QuerySiteDomains from 'components/data/query-site-domains';
import { getDecoratedSiteDomains } from 'state/sites/domains/selectors';
import DomainWarnings from 'my-sites/domains/components/domain-warnings';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import Checklist from 'blocks/checklist';
import { isEnabled } from 'config';
import { jetpackTasks } from 'my-sites/checklist/jetpack-checklist';
import { launchTask } from 'my-sites/checklist/onboardingChecklist';
import getSiteChecklist from 'state/selectors/get-site-checklist';

class CurrentPlan extends Component {
	static propTypes = {
		selectedSiteId: PropTypes.number,
		selectedSite: PropTypes.object,
		isRequestingSitePlans: PropTypes.bool,
		context: PropTypes.object,
		domains: PropTypes.array,
		currentPlan: PropTypes.object,
		isExpiring: PropTypes.bool,
		shouldShowDomainWarnings: PropTypes.bool,
		hasDomainsLoaded: PropTypes.bool,
		isAutomatedTransfer: PropTypes.bool,
	};

	isLoading() {
		const { selectedSite, isRequestingSitePlans: isRequestingPlans } = this.props;

		return ! selectedSite || isRequestingPlans;
	}

	getHeaderWording( planConstObj ) {
		const { translate } = this.props;

		const title = translate( 'Your site is on a %(planName)s plan', {
			args: {
				planName: planConstObj.getTitle(),
			},
		} );

		const tagLine = planConstObj.getTagline
			? planConstObj.getTagline()
			: translate(
					'Unlock the full potential of your site with all the features included in your plan.'
			  );

		return {
			title: title,
			tagLine: tagLine,
		};
	}

	handleAction = id => {
		const { requestTour, siteSlug, tasks, track } = this.props;
		const task = find( tasks, { id } );

		launchTask( {
			task,
			location: 'checklist_show',
			requestTour,
			siteSlug,
			track,
		} );
	};

	handleToggle = id => {
		const { notify, siteId, tasks, update } = this.props;
		const task = find( tasks, { id } );

		if ( task && ! task.completed ) {
			notify( 'is-success', 'You completed a task!' );
			update( siteId, id );
		}
	};

	render() {
		const {
			context,
			currentPlan,
			domains,
			hasDomainsLoaded,
			isAutomatedTransfer,
			isExpiring,
			isJetpack,
			selectedSite,
			selectedSiteId,
			shouldShowDomainWarnings,
			tasks,
			translate,
		} = this.props;

		const currentPlanSlug = selectedSite.plan.product_slug,
			isLoading = this.isLoading();

		const planConstObj = getPlan( currentPlanSlug ),
			planFeaturesHeader = translate( '%(planName)s plan features', {
				args: { planName: planConstObj.getTitle() },
			} );

		const { title, tagLine } = this.getHeaderWording( planConstObj );

		const shouldQuerySiteDomains = selectedSiteId && shouldShowDomainWarnings;
		const showDomainWarnings = hasDomainsLoaded && shouldShowDomainWarnings;
		return (
			<Main className="current-plan" wideLayout>
				<SidebarNavigation />
				<DocumentHead title={ translate( 'Plans' ) } />
				<QuerySites siteId={ selectedSiteId } />
				<QuerySitePlans siteId={ selectedSiteId } />
				{ shouldQuerySiteDomains && <QuerySiteDomains siteId={ selectedSiteId } /> }

				<PlansNavigation path={ context.path } selectedSite={ selectedSite } />

				{ showDomainWarnings && (
					<DomainWarnings
						domains={ domains }
						position="current-plan"
						selectedSite={ selectedSite }
						ruleWhiteList={ [
							'newDomainsWithPrimary',
							'newDomains',
							'unverifiedDomainsCanManage',
							'pendingGappsTosAcceptanceDomains',
							'unverifiedDomainsCannotManage',
							'wrongNSMappedDomains',
							'newTransfersWrongNS',
						] }
					/>
				) }

				<Fragment>
					<CurrentPlanHeader
						selectedSite={ selectedSite }
						isPlaceholder={ isLoading }
						title={ title }
						tagLine={ tagLine }
						currentPlanSlug={ currentPlanSlug }
						currentPlan={ currentPlan }
						isExpiring={ isExpiring }
						isAutomatedTransfer={ isAutomatedTransfer }
						includePlansLink={ currentPlan && isFreeJetpackPlan( currentPlan ) }
					/>
					{ isJetpack && (
						<Checklist
							isLoading={ ! tasks }
							tasks={ tasks }
							onAction={ this.handleAction }
							onToggle={ this.handleToggle }
						/>
					) }
					<div
						className={ classNames( 'current-plan__header-text current-plan__text', {
							'is-placeholder': { isLoading },
						} ) }
					>
						<h1 className="current-plan__header-heading">{ planFeaturesHeader }</h1>
					</div>
					<ProductPurchaseFeaturesList plan={ currentPlanSlug } isPlaceholder={ isLoading } />
				</Fragment>

				<TrackComponentView eventName={ 'calypso_plans_my_plan_view' } />
			</Main>
		);
	}
}

export default connect( ( state, { context } ) => {
	const selectedSite = getSelectedSite( state );
	const selectedSiteId = getSelectedSiteId( state );
	const siteChecklist = getSiteChecklist( state, selectedSiteId );
	const domains = getDecoratedSiteDomains( state, selectedSiteId );

	const isJetpack = isJetpackSite( state, selectedSiteId );
	const isAutomatedTransfer = isSiteAutomatedTransfer( state, selectedSiteId );

	const tasks = isJetpack ? jetpackTasks( siteChecklist ) : [];

	return {
		checklistAvailable:
			! isAutomatedTransfer && ( isEnabled( 'jetpack/checklist' ) || ! isJetpack ),
		context,
		currentPlan: getCurrentPlan( state, selectedSiteId ),
		domains,
		hasDomainsLoaded: !! domains,
		isAutomatedTransfer,
		isExpiring: isCurrentPlanExpiring( state, selectedSiteId ),
		isJetpack,
		isRequestingSitePlans: isRequestingSitePlans( state, selectedSiteId ),
		selectedSite,
		selectedSiteId,
		shouldShowDomainWarnings: ! isJetpack || isAutomatedTransfer,
		tasks,
	};
} )( localize( CurrentPlan ) );
