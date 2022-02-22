import { planHasFeature, FEATURE_UPLOAD_THEMES_PLUGINS } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { isDesktop, subscribeIsDesktop } from '@automattic/viewport';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryPlans from 'calypso/components/data/query-plans';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import MarketingMessage from 'calypso/components/marketing-message';
import Notice from 'calypso/components/notice';
import PlansComparison from 'calypso/my-sites/plans-comparison';
import StepWrapper from 'calypso/signup/step-wrapper';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import hasInitializedSites from 'calypso/state/selectors/has-initialized-sites';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getSiteType } from 'calypso/state/signup/steps/site-type/selectors';
import { getSiteBySlug } from 'calypso/state/sites/selectors';
import './style.scss';

export class PlansStep extends Component {
	state = {
		isDesktop: isDesktop(),
	};

	componentDidMount() {
		this.unsubscribe = subscribeIsDesktop( ( matchesDesktop ) =>
			this.setState( { isDesktop: matchesDesktop } )
		);
		this.props.saveSignupStep( { stepName: this.props.stepName } );
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	onSelectPlan = ( cartItem ) => {
		const { additionalStepData, stepSectionName, stepName, flowName } = this.props;

		if ( cartItem ) {
			this.props.recordTracksEvent( 'calypso_signup_plan_select', {
				product_slug: cartItem.product_slug,
				free_trial: cartItem.free_trial,
				from_section: stepSectionName ? stepSectionName : 'default',
			} );

			// If we're inside the store signup flow and the cart item is a Business or eCommerce Plan,
			// set a flag on it. It will trigger Automated Transfer when the product is being
			// activated at the end of the checkout process.
			if (
				flowName === 'ecommerce' &&
				planHasFeature( cartItem.product_slug, FEATURE_UPLOAD_THEMES_PLUGINS )
			) {
				cartItem.extra = Object.assign( cartItem.extra || {}, {
					is_store_signup: true,
				} );
			}
		} else {
			this.props.recordTracksEvent( 'calypso_signup_free_plan_select', {
				from_section: stepSectionName ? stepSectionName : 'default',
			} );
		}

		const step = {
			stepName,
			stepSectionName,
			cartItem,
			...additionalStepData,
		};

		this.props.submitSignupStep( step, {
			cartItem,
		} );
		this.props.goToNextStep();
	};

	getDomainName() {
		return (
			this.props.signupDependencies.domainItem && this.props.signupDependencies.domainItem.meta
		);
	}

	handleFreePlanButtonClick = () => {
		this.onSelectPlan( null ); // onUpgradeClick expects a cart item -- null means Free Plan.
	};

	plansFeaturesList() {
		const { selectedSite } = this.props;

		let errorDisplay;
		if ( 'invalid' === this.props.step?.status ) {
			errorDisplay = (
				<div>
					<Notice status="is-error" showDismiss={ false }>
						{ this.props.step.errors.message }
					</Notice>
				</div>
			);
		}

		return (
			<div>
				{ errorDisplay }
				<QueryPlans />
				<PlansComparison
					isInSignup={ true }
					onSelectPlan={ this.onSelectPlan }
					selectedSiteId={ selectedSite?.ID || undefined }
				/>
			</div>
		);
	}

	renderLoading() {
		return (
			<div className="plans__loading">
				<LoadingEllipsis active />
			</div>
		);
	}

	getHeaderText() {
		const { headerText, translate } = this.props;

		if ( this.state.isDesktop ) {
			return translate( 'Choose a plan' );
		}

		return headerText || translate( "Pick a plan that's right for you." );
	}

	getSubHeaderText() {
		const { hideFreePlan, subHeaderText, translate } = this.props;

		if ( ! hideFreePlan ) {
			if ( this.state.isDesktop ) {
				return translate(
					"Pick one that's right for you and unlock features that help you grow. Or {{link}}start with a free site{{/link}}.",
					{
						components: {
							link: <Button onClick={ this.handleFreePlanButtonClick } borderless={ true } />,
						},
					}
				);
			}

			return translate( 'Choose a plan or {{link}}start with a free site{{/link}}.', {
				components: {
					link: <Button onClick={ this.handleFreePlanButtonClick } borderless={ true } />,
				},
			} );
		}

		if ( this.state.isDesktop ) {
			return translate( "Pick one that's right for you and unlock features that help you grow." );
		}

		return subHeaderText || translate( 'Choose a plan. Upgrade as you grow.' );
	}

	plansFeaturesSelection() {
		const {
			flowName,
			stepName,
			positionInFlow,
			translate,
			hasInitializedSitesBackUrl,
			steps,
		} = this.props;

		const headerText = this.getHeaderText();
		const fallbackHeaderText = this.props.fallbackHeaderText || headerText;
		const subHeaderText = this.getSubHeaderText();
		const fallbackSubHeaderText = this.props.fallbackSubHeaderText || subHeaderText;

		let backUrl;
		let backLabelText;

		if ( 0 === positionInFlow && hasInitializedSitesBackUrl ) {
			backUrl = hasInitializedSitesBackUrl;
			backLabelText = translate( 'Back to My Sites' );
		}

		let queryParams;
		if ( ! isNaN( Number( positionInFlow ) ) && 0 !== positionInFlow ) {
			const previousStepName = steps[ this.props.positionInFlow - 1 ];
			const previousStep = this.props.progress?.[ previousStepName ];

			const isComingFromUseYourDomainStep = 'use-your-domain' === previousStep?.stepSectionName;

			if ( isComingFromUseYourDomainStep ) {
				queryParams = {
					...this.props.queryParams,
					step: 'transfer-or-connect',
					initialQuery: previousStep?.siteUrl,
				};
			}
		}

		return (
			<>
				<StepWrapper
					flowName={ flowName }
					stepName={ stepName }
					positionInFlow={ positionInFlow }
					headerText={ headerText }
					fallbackHeaderText={ fallbackHeaderText }
					subHeaderText={ subHeaderText }
					fallbackSubHeaderText={ fallbackSubHeaderText }
					isWideLayout={ true }
					stepContent={ this.plansFeaturesList() }
					allowBackFirstStep={ !! hasInitializedSitesBackUrl }
					backUrl={ backUrl }
					backLabelText={ backLabelText }
					queryParams={ queryParams }
				/>
			</>
		);
	}

	render() {
		const classes = classNames( 'plans plans-step', {
			'in-vertically-scrolled-plans-experiment': this.props.isInVerticalScrollingPlansExperiment,
			'has-no-sidebar': true,
			'is-wide-layout': true,
		} );

		return (
			<>
				<MarketingMessage path="signup/plans" />
				<div className={ classes }>{ this.plansFeaturesSelection() }</div>
			</>
		);
	}
}

PlansStep.propTypes = {
	additionalStepData: PropTypes.object,
	goToNextStep: PropTypes.func.isRequired,
	selectedSite: PropTypes.object,
	stepName: PropTypes.string.isRequired,
	stepSectionName: PropTypes.string,
	customerType: PropTypes.string,
	translate: PropTypes.func.isRequired,
	planTypes: PropTypes.array,
	flowName: PropTypes.string,
	isTreatmentPlansReorderTest: PropTypes.bool,
};

export default connect(
	( state, { signupDependencies: { siteSlug } } ) => ( {
		// This step could be used to set up an existing site, in which case
		// some descendants of this component may display discounted prices if
		// they apply to the given site.
		selectedSite: siteSlug ? getSiteBySlug( state, siteSlug ) : null,
		siteType: getSiteType( state ),
		hasInitializedSitesBackUrl: hasInitializedSites( state ) ? '/sites/' : false,
	} ),
	{ recordTracksEvent, saveSignupStep, submitSignupStep }
)( localize( PlansStep ) );
