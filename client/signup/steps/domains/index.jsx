/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defer, endsWith, get, isEmpty } from 'lodash';
import { localize, getLocaleSlug } from 'i18n-calypso';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import MapDomainStep from 'components/domains/map-domain-step';
import TransferDomainStep from 'components/domains/transfer-domain-step';
import UseYourDomainStep from 'components/domains/use-your-domain-step';
import RegisterDomainStep from 'components/domains/register-domain-step';
import SignupActions from 'lib/signup/actions';
import { getStepUrl } from 'signup/utils';
import StepWrapper from 'signup/step-wrapper';
import { cartItems } from 'lib/cart-values';
import { DOMAINS_WITH_PLANS_ONLY } from 'state/current-user/constants';
import { getSurveyVertical } from 'state/signup/steps/survey/selectors.js';
import { getUsernameSuggestion } from 'lib/signup/step-actions';
import {
	recordAddDomainButtonClick,
	recordAddDomainButtonClickInMapDomain,
	recordAddDomainButtonClickInTransferDomain,
	recordAddDomainButtonClickInUseYourDomain,
} from 'state/domains/actions';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { getCurrentUser, currentUserHasFlag } from 'state/current-user/selectors';
import Notice from 'components/notice';
import { getDesignType } from 'state/signup/steps/design-type/selectors';
import { setDesignType } from 'state/signup/steps/design-type/actions';
import { getSiteGoals } from 'state/signup/steps/site-goals/selectors';
import { getDomainProductSlug } from 'lib/domains';
import QueryProductsList from 'components/data/query-products-list';
import { getAvailableProductsList } from 'state/products-list/selectors';

class DomainsStep extends React.Component {
	static propTypes = {
		forceDesignType: PropTypes.string,
		domainsWithPlansOnly: PropTypes.bool,
		flowName: PropTypes.string.isRequired,
		goToNextStep: PropTypes.func.isRequired,
		isDomainOnly: PropTypes.bool.isRequired,
		locale: PropTypes.string,
		path: PropTypes.string.isRequired,
		positionInFlow: PropTypes.number.isRequired,
		queryObject: PropTypes.object,
		signupProgress: PropTypes.array.isRequired,
		step: PropTypes.object,
		stepName: PropTypes.string.isRequired,
		stepSectionName: PropTypes.string,
	};

	static contextTypes = {
		store: PropTypes.object,
	};

	constructor( props ) {
		super( props );

		const { flowName, signupDependencies } = props;
		const importUrl = get( signupDependencies, 'importUrl' );

		if ( flowName === 'import' && importUrl ) {
			this.skipRender = true;

			SignupActions.submitSignupStep( {
				flowName,
				siteUrl: importUrl,
				stepName: props.stepName,
				stepSectionName: props.stepSectionName,
			} );
			props.goToNextStep();
			return;
		}

		this.skipRender = false;

		const domain = get( props, 'queryObject.new', false );
		if (
			this.isDomainsFirstFlow() &&
			domain &&
			// If someone has a better idea on how to figure if the user landed anew
			// Because we persist the signupDependencies, but still want the user to be able to go back to search screen
			props.path.indexOf( '?' ) !== -1
		) {
			this.skipRender = true;
			const productSlug = getDomainProductSlug( domain );
			const domainItem = cartItems.domainRegistration( { productSlug, domain } );

			SignupActions.submitSignupStep(
				Object.assign( {
					processingMessage: props.translate( 'Adding your domain' ),
					stepName: props.stepName,
					domainItem,
					siteUrl: domain,
					isPurchasingItem: true,
					stepSectionName: props.stepSectionName,
				} ),
				[],
				{ domainItem }
			);

			props.goToNextStep();
		}
	}

	getMapDomainUrl = () => {
		return getStepUrl( this.props.flowName, this.props.stepName, 'mapping', this.props.locale );
	};

	getTransferDomainUrl = () => {
		return getStepUrl( this.props.flowName, this.props.stepName, 'transfer', this.props.locale );
	};

	getUseYourDomainUrl = () => {
		return getStepUrl(
			this.props.flowName,
			this.props.stepName,
			'use-your-domain',
			this.props.locale
		);
	};

	handleAddDomain = suggestion => {
		const stepData = {
			stepName: this.props.stepName,
			suggestion,
		};

		this.props.recordAddDomainButtonClick( suggestion.domain_name, this.getAnalyticsSection() );

		SignupActions.saveSignupStep( stepData );

		defer( () => {
			this.submitWithDomain();
		} );
	};

	isPurchasingTheme = () => {
		return this.props.queryObject && this.props.queryObject.premium;
	};

	getThemeSlug = () => {
		return this.props.queryObject ? this.props.queryObject.theme : undefined;
	};

	getThemeArgs = () => {
		const themeSlug = this.getThemeSlug(),
			themeSlugWithRepo = this.getThemeSlugWithRepo( themeSlug ),
			themeItem = this.isPurchasingTheme()
				? cartItems.themeItem( themeSlug, 'signup-with-theme' )
				: undefined;

		return { themeSlug, themeSlugWithRepo, themeItem };
	};

	getThemeSlugWithRepo = themeSlug => {
		if ( ! themeSlug ) {
			return undefined;
		}
		const repo = this.isPurchasingTheme() ? 'premium' : 'pub';
		return `${ repo }/${ themeSlug }`;
	};

	submitWithDomain = googleAppsCartItem => {
		const suggestion = this.props.step.suggestion,
			isPurchasingItem = Boolean( suggestion.product_slug ),
			siteUrl = isPurchasingItem
				? suggestion.domain_name
				: suggestion.domain_name.replace( '.wordpress.com', '' ),
			domainItem = isPurchasingItem
				? cartItems.domainRegistration( {
						domain: suggestion.domain_name,
						productSlug: suggestion.product_slug,
				  } )
				: undefined;

		this.props.submitDomainStepSelection( suggestion, this.getAnalyticsSection() );

		SignupActions.submitSignupStep(
			Object.assign(
				{
					processingMessage: this.props.translate( 'Adding your domain' ),
					stepName: this.props.stepName,
					domainItem,
					googleAppsCartItem,
					isPurchasingItem,
					siteUrl,
					stepSectionName: this.props.stepSectionName,
				},
				this.getThemeArgs()
			),
			[],
			{ domainItem }
		);

		this.props.setDesignType( this.getDesignType() );
		this.props.goToNextStep();

		// Start the username suggestion process.
		getUsernameSuggestion( siteUrl.split( '.' )[ 0 ], this.context.store );
	};

	handleAddMapping = ( sectionName, domain, state ) => {
		const domainItem = cartItems.domainMapping( { domain } );
		const isPurchasingItem = true;

		this.props.recordAddDomainButtonClickInMapDomain( domain, this.getAnalyticsSection() );

		SignupActions.submitSignupStep(
			Object.assign(
				{
					processingMessage: this.props.translate( 'Adding your domain mapping' ),
					stepName: this.props.stepName,
					[ sectionName ]: state,
					domainItem,
					isPurchasingItem,
					siteUrl: domain,
					stepSectionName: this.props.stepSectionName,
				},
				this.getThemeArgs()
			),
			[],
			{ domainItem }
		);

		this.props.goToNextStep();
	};

	handleAddTransfer = ( domain, authCode ) => {
		const domainItem = cartItems.domainTransfer( {
			domain,
			extra: {
				auth_code: authCode,
				signup: true,
			},
		} );
		const isPurchasingItem = true;

		this.props.recordAddDomainButtonClickInTransferDomain( domain, this.getAnalyticsSection() );

		SignupActions.submitSignupStep(
			Object.assign(
				{
					processingMessage: this.props.translate( 'Adding your domain transfer' ),
					stepName: this.props.stepName,
					[ 'transfer' ]: {},
					domainItem,
					isPurchasingItem,
					siteUrl: domain,
					stepSectionName: this.props.stepSectionName,
				},
				this.getThemeArgs()
			),
			[],
			{ domainItem }
		);

		this.props.goToNextStep();
	};

	handleSave = ( sectionName, state ) => {
		SignupActions.saveSignupStep( {
			stepName: this.props.stepName,
			stepSectionName: this.props.stepSectionName,
			[ sectionName ]: state,
		} );
	};

	isDomainForAtomicSite = () => {
		return 'store' === this.getDesignType();
	};

	getDesignType = () => {
		if ( this.props.forceDesignType ) {
			return this.props.forceDesignType;
		}

		if ( this.props.signupDependencies && this.props.signupDependencies.designType ) {
			return this.props.signupDependencies.designType;
		}

		return this.props.designType;
	};

	shouldIncludeDotBlogSubdomain() {
		const { flowName, siteGoals } = this.props;
		const siteGoalsArray = siteGoals ? siteGoals.split( ',' ) : [];

		return (
			// 'subdomain' flow coming from .blog landing pages
			flowName === 'subdomain' ||
			// User picked only 'share' on the `about` step
			( siteGoalsArray.length === 1 &&
				siteGoalsArray.indexOf( 'share' ) !== -1 &&
				// abtest() assignment should come last
				abtest( 'includeDotBlogSubdomainV2' ) === 'yes' )
		);
	}

	domainForm = () => {
		let initialState = {};
		if ( this.state ) {
			initialState = this.state.domainForm;
		}
		if ( this.props.step ) {
			initialState = this.props.step.domainForm;
		}

		return (
			<RegisterDomainStep
				key="domainForm"
				path={ this.props.path }
				initialState={ initialState }
				onAddDomain={ this.handleAddDomain }
				products={ this.props.productsList }
				basePath={ this.props.path }
				mapDomainUrl={ this.getMapDomainUrl() }
				transferDomainUrl={ this.getTransferDomainUrl() }
				useYourDomainUrl={ this.getUseYourDomainUrl() }
				onAddMapping={ this.handleAddMapping.bind( this, 'domainForm' ) }
				onSave={ this.handleSave.bind( this, 'domainForm' ) }
				offerUnavailableOption={ ! this.props.isDomainOnly && ! this.isDomainsFirstFlow() }
				analyticsSection={ this.getAnalyticsSection() }
				domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
				includeWordPressDotCom={
					! this.props.isDomainOnly && ! this.isDomainForAtomicSite() && ! this.isDomainsFirstFlow()
				}
				includeDotBlogSubdomain={ this.shouldIncludeDotBlogSubdomain() }
				isSignupStep
				showExampleSuggestions
				surveyVertical={ this.props.surveyVertical }
				suggestion={ get( this.props, 'queryObject.new', '' ) }
				designType={ this.getDesignType() }
				vendor="domainsbot"
			/>
		);
	};

	mappingForm = () => {
		const initialState = this.props.step ? this.props.step.mappingForm : undefined,
			initialQuery =
				this.props.step && this.props.step.domainForm && this.props.step.domainForm.lastQuery;

		return (
			<div className="domains__step-section-wrapper" key="mappingForm">
				<MapDomainStep
					analyticsSection={ this.getAnalyticsSection() }
					initialState={ initialState }
					path={ this.props.path }
					onRegisterDomain={ this.handleAddDomain }
					onMapDomain={ this.handleAddMapping.bind( this, 'mappingForm' ) }
					onSave={ this.handleSave.bind( this, 'mappingForm' ) }
					products={ this.props.productsList }
					domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
					initialQuery={ initialQuery }
				/>
			</div>
		);
	};

	onTransferSave = state => {
		this.handleSave( 'transferForm', state );
	};

	transferForm = () => {
		const initialQuery =
			this.props.step && this.props.step.domainForm && this.props.step.domainForm.lastQuery;

		return (
			<div className="domains__step-section-wrapper" key="transferForm">
				<TransferDomainStep
					analyticsSection={ this.getAnalyticsSection() }
					basePath={ this.props.path }
					domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
					initialQuery={ initialQuery }
					isSignupStep
					mapDomainUrl={ this.getMapDomainUrl() }
					onRegisterDomain={ this.handleAddDomain }
					onTransferDomain={ this.handleAddTransfer }
					onSave={ this.onTransferSave }
					products={ this.props.productsList }
				/>
			</div>
		);
	};

	useYourDomainForm = () => {
		const initialQuery =
			this.props.step && this.props.step.domainForm && this.props.step.domainForm.lastQuery;

		return (
			<div className="domains__step-section-wrapper" key="useYourDomainForm">
				<UseYourDomainStep
					analyticsSection={ this.getAnalyticsSection() }
					basePath={ this.props.path }
					domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
					initialQuery={ initialQuery }
					isSignupStep
					mapDomainUrl={ this.getMapDomainUrl() }
					transferDomainUrl={ this.getTransferDomainUrl() }
					products={ this.props.productsList }
				/>
			</div>
		);
	};

	getSubHeaderText() {
		const { translate } = this.props;
		return 'transfer' === this.props.stepSectionName || 'mapping' === this.props.stepSectionName
			? translate( 'Use a domain you already own with your new WordPress.com site.' )
			: translate( "Enter your site's name or some keywords that describe it to get started." );
	}

	isDomainsFirstFlow() {
		return 'domain' === this.props.flowName;
	}

	getAnalyticsSection() {
		return this.isDomainsFirstFlow() ? 'domain-first' : 'signup';
	}

	renderContent() {
		let content;

		if ( 'mapping' === this.props.stepSectionName ) {
			content = this.mappingForm();
		}

		if ( 'transfer' === this.props.stepSectionName ) {
			content = this.transferForm();
		}

		if ( 'use-your-domain' === this.props.stepSectionName ) {
			content = this.useYourDomainForm();
		}

		if ( ! this.props.stepSectionName || this.isDomainsFirstFlow() ) {
			content = this.domainForm();
		}

		if ( this.props.step && 'invalid' === this.props.step.status ) {
			content = (
				<div className="domains__step-section-wrapper">
					<Notice status="is-error" showDismiss={ false }>
						{ this.props.step.errors.message }
					</Notice>
					{ content }
				</div>
			);
		}

		return (
			<CSSTransition
				key={ this.props.step + this.props.stepSectionName }
				classNames="domains__step-content"
				timeout={ 200 }
				exit={ false }
			>
				{ content }
			</CSSTransition>
		);
	}

	render() {
		if ( this.skipRender ) {
			return null;
		}

		const { translate } = this.props;
		let backUrl = undefined;

		if ( 'transfer' === this.props.stepSectionName || 'mapping' === this.props.stepSectionName ) {
			backUrl = getStepUrl(
				this.props.flowName,
				this.props.stepName,
				'use-your-domain',
				getLocaleSlug()
			);
		} else if ( this.props.stepSectionName ) {
			backUrl = getStepUrl( this.props.flowName, this.props.stepName, undefined, getLocaleSlug() );
		}

		const fallbackSubHeaderText = this.getSubHeaderText();

		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				backUrl={ backUrl }
				positionInFlow={ this.props.positionInFlow }
				signupProgress={ this.props.signupProgress }
				fallbackHeaderText={ translate( 'Give your site an address.' ) }
				fallbackSubHeaderText={ fallbackSubHeaderText }
				stepContent={
					<TransitionGroup>
						{ ! this.props.productsLoaded && <QueryProductsList /> }
						{ this.renderContent() }
					</TransitionGroup>
				}
			/>
		);
	}
}

const submitDomainStepSelection = ( suggestion, section ) => {
	let domainType = 'domain_reg';
	if ( suggestion.is_free ) {
		domainType = 'wpcom_subdomain';
		if ( endsWith( suggestion.domain_name, '.blog' ) ) {
			domainType = 'dotblog_subdomain';
		}
	}

	const tracksObjects = {
		domain_name: suggestion.domain_name,
		section,
		type: domainType,
	};
	if ( suggestion.isRecommended ) {
		tracksObjects.label = 'recommended';
	}
	if ( suggestion.isBestAlternative ) {
		tracksObjects.label = 'best-alternative';
	}

	return composeAnalytics(
		recordGoogleEvent(
			'Domain Search',
			`Submitted Domain Selection for a ${ domainType } on a Domain Registration`,
			'Domain Name',
			suggestion.domain_name
		),
		recordTracksEvent( 'calypso_domain_search_submit_step', tracksObjects )
	);
};

export default connect(
	state => {
		const productsList = getAvailableProductsList( state );
		const productsLoaded = ! isEmpty( productsList );

		return {
			designType: getDesignType( state ),
			// no user = DOMAINS_WITH_PLANS_ONLY
			domainsWithPlansOnly: getCurrentUser( state )
				? currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY )
				: true,
			productsList,
			productsLoaded,
			siteGoals: getSiteGoals( state ),
			surveyVertical: getSurveyVertical( state ),
		};
	},
	{
		recordAddDomainButtonClick,
		recordAddDomainButtonClickInMapDomain,
		recordAddDomainButtonClickInTransferDomain,
		recordAddDomainButtonClickInUseYourDomain,
		submitDomainStepSelection,
		setDesignType,
	}
)( localize( DomainsStep ) );
