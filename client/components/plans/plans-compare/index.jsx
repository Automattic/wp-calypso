/**
 * External dependencies
 */
import classNames from 'classnames';
import { connect } from 'react-redux';
import find from 'lodash/find';
import page from 'page';
import React from 'react';
import times from 'lodash/times';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import analytics from 'lib/analytics';
import Card from 'components/card';
import { fetchSitePlans } from 'state/sites/plans/actions';
import { filterPlansBySiteAndProps, shouldFetchSitePlans, isGoogleVouchersEnabled, isWordpressAdCreditsEnabled } from 'lib/plans';
import { getPlans } from 'state/plans/selectors';
import { getPlansBySite } from 'state/sites/plans/selectors';
import Gridicon from 'components/gridicon';
import HeaderCake from 'components/header-cake';
import { isFreePlan, isPersonal, isPremium, isBusiness } from 'lib/products-values';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import observe from 'lib/mixins/data-observe';
import PlanActions from 'components/plans/plan-actions';
import PlanHeader from 'components/plans/plan-header';
import PlanPrice from 'components/plans/plan-price';
import SectionNav from 'components/section-nav';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { SUBMITTING_WPCOM_REQUEST } from 'lib/store-transactions/step-types';
import QueryPlans from 'components/data/query-plans';
import config from 'config';
import InfoPopover from 'components/info-popover';
import { isJetpack } from 'lib/site/utils';
import {
	featuresList,
	FEATURE_GOOGLE_AD_CREDITS,
	WORDADS_INSTANT,
} from 'lib/plans/constants';

// google ad credits feature
const googleAdCredits = featuresList[ FEATURE_GOOGLE_AD_CREDITS ];
const googleAdCreditsFeature = {
	title: googleAdCredits.getTitle(),
	compareDescription: isWordpressAdCreditsEnabled() ? googleAdCredits.getDescriptionWithWordAdsCredit() : googleAdCredits.getDescription(),
	product_slug: FEATURE_GOOGLE_AD_CREDITS,
	1: false,
	1003: '$100',
	1008: isWordpressAdCreditsEnabled() ? '$200' : '$100'
};
// WordAds instant activation feature
const wordAdsInstant = featuresList[ WORDADS_INSTANT ];
const wordAdsFeature = {
	title: wordAdsInstant.getTitle(),
	compareDescription: wordAdsInstant.getDescription(),
	1: false,
	1003: true,
	1008: true,
	product_slug: WORDADS_INSTANT,
};

const PlansCompare = React.createClass( {
	mixins: [ observe( 'features' ) ],

	componentWillReceiveProps( nextProps ) {
		this.props.fetchSitePlans( nextProps.sitePlans, nextProps.selectedSite );
	},

	getInitialState() {
		return { selectedPlan: 'premium' };
	},

	getDefaultProps() {
		return {
			isInSignup: false
		};
	},

	componentDidMount() {
		analytics.tracks.recordEvent( 'calypso_plans_compare', {
			is_in_signup: this.props.isInSignup
		} );

		if ( ! this.props.isInSignup ) {
			this.props.fetchSitePlans( this.props.sitePlans, this.props.selectedSite );
		}
	},

	recordViewAllPlansClick() {
		analytics.ga.recordEvent( 'Upgrades', 'Clicked View All Plans' );
	},

	getPlanURL() {
		const selectedSite = this.props.selectedSite;
		let url = '/plans';

		if ( 'monthly' === this.props.intervalType ) {
			url += '/monthly';
		}

		if ( selectedSite ) {
			url += '/' + selectedSite.slug;
		}
		return url;
	},

	goBack() {
		this.recordViewAllPlansClick();
		return page.back( this.props.backUrl || this.getPlanURL() );
	},

	isDataLoading() {
		if ( ! this.props.features.get() ) {
			return true;
		}

		if ( this.props.isInSignup ) {
			return false;
		}

		if ( ! this.props.selectedSite ) {
			return false;
		}

		if ( this.props.sitePlans && this.props.sitePlans.hasLoadedFromServer ) {
			return false;
		}

		return true;
	},

	isSelected( plan ) {
		if ( this.state.selectedPlan === 'free' ) {
			return isFreePlan( plan );
		}

		if ( this.state.selectedPlan === 'personal' ) {
			return isPersonal( plan );
		}

		if ( this.state.selectedPlan === 'premium' ) {
			return isPremium( plan );
		}

		if ( this.state.selectedPlan === 'business' ) {
			return isBusiness( plan );
		}
	},

	isSubmitting() {
		if ( ! this.props.transaction ) {
			return false;
		}

		return this.props.transaction.step.name === SUBMITTING_WPCOM_REQUEST;
	},

	getColumnCount() {
		const colsCount = abtest( 'personalPlan' ) === 'hide' ? 4 : 5;

		if ( ! this.props.selectedSite || ! this.props.selectedSite.jetpack ) {
			return colsCount;
		}

		// column count for jetpack site
		return 3;
	},

	getFeatures() {
		const plans = this.getPlans();
		const { selectedSite } = this.props;

		let features = this.props.features.get().filter( ( feature ) => {
			return plans.some( plan => {
				return feature[ plan.product_id ];
			} );
		} );

		if ( isJetpack( selectedSite ) ) {
			return features;
		}

		// add google-ad-credits feature
		if ( isGoogleVouchersEnabled() ) {
			features.splice( 1, 0, googleAdCreditsFeature );
		}

		if ( config.isEnabled( 'manage/ads/wordads-instant' ) && abtest( 'wordadsInstantActivation' ) === 'enabled' ) {
			features.splice( 6, 0, wordAdsFeature );
		}

		return features;
	},

	getPlans() {
		return filterPlansBySiteAndProps(
			this.props.plans,
			this.props.selectedSite,
			this.props.hideFreePlan,
			this.props.intervalType
		);
	},

	getSitePlan( plan ) {
		return this.props.sitePlans && this.props.sitePlans.hasLoadedFromServer
			? find( this.props.sitePlans.data, { productSlug: plan.product_slug } )
			: undefined;
	},

	getTableHeader() {
		let planElements;

		if ( this.isDataLoading() ) {
			planElements = times( this.getColumnCount(), ( n ) => {
				if ( n === 0 ) {
					return <th className="plans-compare__header-cell" key={ n } />;
				}

				return (
					<th key={ n } className="plans-compare__header-cell">
						<div className="plans-compare__header-cell-placeholder" />
					</th>
				);
			} );
		} else {
			const plans = this.getPlans();

			planElements = [ <th className="plans-compare__header-cell" key="placeholder" /> ];

			planElements = planElements.concat( plans.map( ( plan ) => {
				const sitePlan = this.getSitePlan( plan ),
					classes = classNames( 'plans-compare__header-cell', {
						'is-selected': this.isSelected( plan )
					} );

				return (
					<th className={ classes } key={ plan.product_slug }>
						<PlanHeader key={ plan.product_slug }>
							<PlanActions
								plan={ plan }
								isInSignup={ this.props.isInSignup }
								onSelectPlan={ this.props.onSelectPlan }
								sitePlan={ sitePlan }
								site={ this.props.selectedSite }
								cart={ this.props.cart }
								selectedFeature={ this.props.selectedFeature }
								isSubmitting={ this.isSubmitting() }
								isImageButton />
							<span className="plans-compare__plan-name">
								{ plan.product_name_short }
							</span>
							<PlanPrice
								plan={ plan }
								sitePlan={ sitePlan } />
						</PlanHeader>
					</th>
				);
			} ) );
		}

		return (
			<tr>{ planElements }</tr>
		);
	},

	getTableFeatureRows() {
		let rows;

		if ( this.isDataLoading() ) {
			rows = times( 8, ( i ) => {
				const cells = times( this.getColumnCount(), ( n ) => {
					const classes = classNames( 'plans-compare__cell-placeholder', {
						'is-plan-specific': n !== 0
					} );

					return (
						<td className="plans-compare__cell" key={ n }>
							<div className={ classes } />
						</td>
					);
				} );

				return (
					<tr className="plans-compare__row" key={ i }>{ cells }</tr>
				);
			} );
		} else {
			const plans = this.getPlans();
			const features = this.getFeatures();

			rows = features.map( ( feature ) => {
				const planFeatures = plans.map( ( plan ) => {
					const classes = classNames( 'plans-compare__cell', 'is-plan-specific', {
							'is-selected': this.isSelected( plan )
						} ),
						mobileClasses = classNames( 'plans-compare__feature-title-mobile', {
							'is-available': feature[ plan.product_id ]
						} );

					let content;

					if (
						typeof feature[ plan.product_id ] === 'boolean' &&
						feature[ plan.product_id ]
					) {
						content = <Gridicon icon="checkmark-circle" size={ 24 } />;
					}

					if ( typeof feature[ plan.product_id ] === 'string' ) {
						content = feature[ plan.product_id ];
					}

					return (
						<td
							className={ classes }
							key={ plan.product_id }>
							<div className={ mobileClasses }>
								{ this.renderFeatureTitle( feature ) }
							</div>
							<div className="plans-compare__cell-content">
								{ content }
							</div>
						</td>
					);
				} );

				const isHighlighted = this.props.selectedFeature &&
					this.props.selectedFeature.toLowerCase() === feature.product_slug.split( '/' )[ 0 ].toLowerCase();
				const classes = classNames( 'plans-compare__row', {
					'is-highlighted': isHighlighted
				} );

				return (
					<tr className={ classes } key={ feature.title }>
						<td
							className="plans-compare__cell"
							key={ feature.title }>
							{ this.renderFeatureTitle( feature ) }
						</td>
						{ planFeatures }
					</tr>
				);
			} );
		}

		return rows;
	},

	getTableActionRow() {
		if ( this.isDataLoading() ) {
			return null;
		}

		const plans = this.getPlans();

		let cells = [ <td className="plans-compare__action-cell" key="placeholder" /> ];

		cells = cells.concat( plans.map( ( plan ) => {
			const sitePlan = this.getSitePlan( plan ),
				classes = classNames( 'plans-compare__action-cell', {
					'is-selected': this.isSelected( plan )
				} );

			return (
				<td className={ classes } key={ plan.product_id }>
					<PlanActions
						onSelectPlan={ this.props.onSelectPlan }
						isInSignup={ this.props.isInSignup }
						plan={ plan }
						site={ this.props.selectedSite }
						sitePlan={ sitePlan }
						selectedFeature={ this.props.selectedFeature }
						isSubmitting={ this.isSubmitting() }
						cart={ this.props.cart } />
				</td>
			);
		} ) );

		return (
			<tr>{ cells }</tr>
		);
	},

	comparisonTable() {
		return (
			<table className="plans-compare__table">
				<thead>
					{ this.getTableHeader() }
				</thead>
				<tbody>
					{ this.getTableFeatureRows() }
					{ this.getTableActionRow() }
				</tbody>
			</table>
		);
	},

	setPlan( name ) {
		this.setState( { selectedPlan: name } );
	},

	sectionNavigationForMobile() {
		const text = {
			free: this.translate( 'Free' ),
			personal: this.translate( 'Personal' ),
			premium: this.translate( 'Premium' ),
			business: this.translate( 'Business' )
		};

		let freeOption = (
			<NavItem
				onClick={ this.setPlan.bind( this, 'free' ) }
				selected={ 'free' === this.state.selectedPlan }>
				{ this.translate( 'Free' ) }
			</NavItem>
		);

		if ( this.props.selectedSite && this.props.selectedSite.jetpack ) {
			freeOption = null;
		}

		return (
			<span className="plans-compare__section-navigation">
				<SectionNav selectedText={ text[ this.state.selectedPlan ] }>
					<NavTabs>
						{ freeOption }
						{ abtest( 'personalPlan' ) === 'show' &&
						<NavItem
							onClick={ this.setPlan.bind( this, 'personal' ) }
							selected={ 'personal' === this.state.selectedPlan }>
							{ this.translate( 'Personal' ) }
						</NavItem>
						}
						<NavItem
							onClick={ this.setPlan.bind( this, 'premium' ) }
							selected={ 'premium' === this.state.selectedPlan }>
							{ this.translate( 'Premium' ) }
						</NavItem>
						<NavItem
							onClick={ this.setPlan.bind( this, 'business' ) }
							selected={ 'business' === this.state.selectedPlan }>
							{ this.translate( 'Business' ) }
						</NavItem>
					</NavTabs>
				</SectionNav>
			</span>
		);
	},

	renderFeatureTitle( feature ) {
		return(
			<div className="plans-compare__feature-title">
				<span className="plans-compare__feature-title__container">
					{ feature.title }
				</span>
				{ feature.compareDescription &&
					<div className="plans-compare__feature-descripcion">
						<InfoPopover position="right">
							{ feature.compareDescription }
						</InfoPopover>
					</div>
				}
			</div>
		);
	},

	render() {
		const classes = classNames( this.props.className, 'plans-compare', {
			'is-placeholder': this.isDataLoading(),
			'is-jetpack-site': this.props.selectedSite && this.props.selectedSite.jetpack
		} );

		let compareString = this.translate( 'Compare Plans' );

		if ( this.props.selectedSite && this.props.selectedSite.jetpack ) {
			compareString = this.translate( 'Compare Options' );
		}

		return (
			<div className={ classes }>
				<QueryPlans />
				{
					this.props.isInSignup
						? null
						: <SidebarNavigation />
				}
				<HeaderCake onClick={ this.goBack }>
					{ compareString }
				</HeaderCake>
				{ this.sectionNavigationForMobile() }
				<Card>
					{ this.comparisonTable() }
				</Card>
			</div>
		);
	}
} );

export default connect(
	( state, props ) => {
		return {
			plans: getPlans( state ),
			sitePlans: getPlansBySite( state, props.selectedSite )
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
)( PlansCompare );
