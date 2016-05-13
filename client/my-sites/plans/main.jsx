/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import React from 'react';
import config from 'config';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { fetchSitePlans } from 'state/sites/plans/actions';
import { getCurrentPlan } from 'lib/plans';
import { getPlansBySite } from 'state/sites/plans/selectors';
import Gridicon from 'components/gridicon';
import ComparisonTable from 'components/comparison-table';
import TableColumn from 'components/comparison-table/table-column';
import { isJpphpBundle } from 'lib/products-values';
import Main from 'components/main';
import Notice from 'components/notice';
import observe from 'lib/mixins/data-observe';
import paths from './paths';
import PlanList from 'components/plans/plan-list' ;
import PlanOverview from './plan-overview';
import { shouldFetchSitePlans } from 'lib/plans';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { SUBMITTING_WPCOM_REQUEST } from 'lib/store-transactions/step-types';
import UpgradesNavigation from 'my-sites/upgrades/navigation';
import WordPressLogo from 'components/wordpress-logo';

const Plans = React.createClass( {
	mixins: [ observe( 'sites', 'plans' ) ],

	propTypes: {
		cart: React.PropTypes.object.isRequired,
		context: React.PropTypes.object.isRequired,
		destinationType: React.PropTypes.string,
		plans: React.PropTypes.object.isRequired,
		fetchSitePlans: React.PropTypes.func.isRequired,
		sites: React.PropTypes.object.isRequired,
		sitePlans: React.PropTypes.object.isRequired,
		transaction: React.PropTypes.object.isRequired
	},

	getInitialState() {
		return { openPlan: '' };
	},

	componentDidMount() {
		this.updateSitePlans( this.props.sitePlans );
	},

	componentWillReceiveProps( nextProps ) {
		this.updateSitePlans( nextProps.sitePlans );
	},

	updateSitePlans( sitePlans ) {
		const selectedSite = this.props.sites.getSelectedSite();

		this.props.fetchSitePlans( sitePlans, selectedSite );
	},

	openPlan( planId ) {
		this.setState( { openPlan: planId === this.state.openPlan ? '' : planId } );
	},

	recordComparePlansClick() {
		analytics.ga.recordEvent( 'Upgrades', 'Clicked Compare Plans Link' );
	},

	comparePlansLink() {
		const selectedSite = this.props.sites.getSelectedSite();
		let url = '/plans/compare',
			compareString = this.translate( 'Compare Plans' );

		if ( selectedSite.jetpack ) {
			compareString = this.translate( 'Compare Options' );
		}

		if ( this.props.plans.get().length <= 0 ) {
			return '';
		}

		if ( selectedSite ) {
			url += '/' + selectedSite.slug;
		}

		return (
			<a href={ url } className="compare-plans-link" onClick={ this.recordComparePlansClick }>
				<Gridicon icon="clipboard" size={ 18 } />
				{ compareString }
			</a>
		);
	},

	redirectToDefault() {
		page.redirect( paths.plans( this.props.sites.getSelectedSite().slug ) );
	},

	renderNotice() {
		if ( 'free-trial-canceled' === this.props.destinationType ) {
			return (
				<Notice onDismissClick={ this.redirectToDefault } status="is-success">
					{ this.translate( 'Your trial has been removed. Thanks for giving it a try!' ) }
				</Notice>
			);
		}
	},

	getMockFeatures() {
		return [
			{ 	name: 'domain',
				description: 'Your own domain',
				free: false,
				personal: '1 Year Free',
				pro: '1 Year Free',
				business: '1 Year Free'
			},
			{	name: 'advertising',
				description: 'Advertising vouchers',
				free: false,
				personal: false,
				pro: '$150 value',
				business: '$300 value'
			},
			{	name: 'google',
				description: 'Google Apps',
				free: false,
				personal: false,
				pro: 'Email only',
				business: 'All services'
			},
			{	name: 'prioritySupport',
				description: 'Priority Support',
				free: false,
				personal: false,
				pro: false,
				business: '24/7 live chat'
			},
			{	name: 'prioritySupport',
				header: true,
				description: 'Design'
			},
			{	name: 'themes',
				description: '150+ High quality themes',
				free: true,
				personal: true,
				pro: true,
				business: true
			},
			{	name: 'customization',
				description: 'Standard Customization',
				free: true,
				personal: true,
				pro: true,
				business: true
			},
			{	name: 'premiumThemes',
				description: 'Free premium themes',
				free: false,
				personal: false,
				pro: true,
				business: true
			},
			{	name: 'advancedCustomization',
				description: 'Advanced Customization',
				free: false,
				personal: false,
				pro: true,
				business: true
			},
			{	name: 'designReviewService',
				description: 'Design Review Service',
				free: false,
				personal: false,
				pro: false,
				business: true
			},
			{	name: 'storageUploads',
				header: true,
				description: 'Storage & Uploads'
			},
			{	name: 'storageSpace',
				description: 'Storage Space',
				free: '500 Mb',
				personal: '1 Gb',
				pro: '5 Gb',
				business: 'Unlimited'
			}

		]
	},

	render() {
		console.log( this.getMockFeatures() );
		const selectedSite = this.props.sites.getSelectedSite();
		let hasJpphpBundle,
			currentPlan;

		if ( this.props.sitePlans.hasLoadedFromServer ) {
			currentPlan = getCurrentPlan( this.props.sitePlans.data );
			hasJpphpBundle = isJpphpBundle( currentPlan );
		}

		if ( this.props.sitePlans.hasLoadedFromServer && currentPlan.freeTrial ) {
			return (
				<PlanOverview
					sitePlans={ this.props.sitePlans }
					path={ this.props.context.path }
					cart={ this.props.cart }
					destinationType={ this.props.context.params.destinationType }
					plan={ currentPlan }
					selectedSite={ selectedSite } />
			);
		}

		return (
			<div>
				{ this.renderNotice() }

				<Main className="wide">
					<SidebarNavigation />

					<div id="plans" className="plans has-sidebar">
						<UpgradesNavigation
							sitePlans={ this.props.sitePlans }
							path={ this.props.context.path }
							cart={ this.props.cart }
							selectedSite={ selectedSite } />
						{ config.isEnabled( 'jetpack/calypso-first-signup-flow' )
							? ( <ComparisonTable
									featuresList={ this.getMockFeatures() }
									columns={ 4 }>

									<TableColumn
										featuresList={ this.getMockFeatures() }
										descriptionColumn >
										<div>
											<WordPressLogo />
											<h2>{ this.translate( 'Yearly Savings Plans' ) }</h2>
											<p>{ this.translate( 'Plans are billed annually and have a 30-day money back guarantee' ) }</p>
										</div>
									</TableColumn>
									<TableColumn
										featuresList={ this.getMockFeatures() }
										comparisonID="free"
										name={ this.translate( 'Free' ) }
										description={ this.translate( 'Just Getting Started' ) }
										price={ 0 }
										currentPlan
										>
									</TableColumn>
									<TableColumn
										featuresList={ this.getMockFeatures() }
										comparisonID="personal"
										name={ this.translate( 'Personal' ) }
										description={ this.translate( 'Just getting started' ) }
										price={ 5.99 }
										>
									</TableColumn>
									<TableColumn
										featuresList={ this.getMockFeatures() }
										comparisonID="pro"
										name={ this.translate( 'Pro' ) }
										description={ this.translate( 'Just getting started' ) }
										price={ 12.99 }
										popular={ true }
										>
									</TableColumn>
									<TableColumn
										featuresList={ this.getMockFeatures() }
										comparisonID="business"
										name={ this.translate( 'Business' ) }
										description={ this.translate( 'Just getting started' ) }
										price={ 24.99 }
										>
									</TableColumn>
								</ComparisonTable> )
							: ( <PlanList
									site={ selectedSite }
									plans={ this.props.plans.get() }
									sitePlans={ this.props.sitePlans }
									onOpen={ this.openPlan }
									cart={ this.props.cart }
									isSubmitting={ this.props.transaction.step.name === SUBMITTING_WPCOM_REQUEST } /> ) }


						{ ! hasJpphpBundle && ! config.isEnabled( 'jetpack/calypso-first-signup-flow' ) && this.comparePlansLink() }
					</div>
				</Main>
			</div>
		);
	}
} );

export default connect(
	( state, props ) => {
		return {
			sitePlans: getPlansBySite( state, props.sites.getSelectedSite() )
		};
	},
	( dispatch ) => {
		return {
			fetchSitePlans( sitePlans, site ) {
				if ( shouldFetchSitePlans( sitePlans, site ) ) {
					dispatch( fetchSitePlans( site.ID ) );
				}
			}
		};
	}
)( Plans );
