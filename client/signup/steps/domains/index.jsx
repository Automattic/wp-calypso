/** @format */
/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defer, endsWith, get } from 'lodash';
import { localize, getLocaleSlug } from 'i18n-calypso';
import ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import MapDomainStep from 'components/domains/map-domain-step';
import TransferDomainStep from 'components/domains/transfer-domain-step';
import UseYourDomainStep from 'components/domains/use-your-domain-step';
import productsListFactory from 'lib/products-list';
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

const productsList = productsListFactory();

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

	state = { products: productsList.get() };

	showDomainSearch = () => {
		page( getStepUrl( this.props.flowName, this.props.stepName, this.props.locale ) );
	};

	getMapDomainUrl = () => {
		return getStepUrl( this.props.flowName, this.props.stepName, 'mapping', this.props.locale );
	};

	getTransferDomainUrl = () => {
		return getStepUrl( this.props.flowName, this.props.stepName, 'transfer', this.props.locale );
	};

	getUseYourDomainUrl = () => {
		const url = getStepUrl(
			this.props.flowName,
			this.props.stepName,
			'use-your-domain',
			this.props.locale
		);
		return url;
	};

	componentDidMount() {
		productsList.on( 'change', this.refreshState );
	}

	componentWillUnmount() {
		productsList.off( 'change', this.refreshState );
	}

	refreshState = () => {
		this.setState( { products: productsList.get() } );
	};

	handleAddDomain = suggestion => {
		const stepData = {
			stepName: this.props.stepName,
			suggestion,
		};

		this.props.recordAddDomainButtonClick( suggestion.domain_name, 'signup' );

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

		this.props.submitDomainStepSelection( suggestion, 'signup' );

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

		this.props.recordAddDomainButtonClickInMapDomain( domain, 'signup' );

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

		this.props.recordAddDomainButtonClickInTransferDomain( domain, 'signup' );

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
			( abtest( 'includeDotBlogSubdomain' ) === 'yes' &&
				siteGoalsArray.length === 1 &&
				siteGoalsArray.indexOf( 'share' ) !== -1 )
		);
	}

	domainForm = () => {
		const initialState = this.props.step ? this.props.step.domainForm : this.state.domainForm;

		return (
			<RegisterDomainStep
				key="domainForm"
				path={ this.props.path }
				initialState={ initialState }
				onAddDomain={ this.handleAddDomain }
				products={ this.state.products }
				basePath={ this.props.path }
				mapDomainUrl={ this.getMapDomainUrl() }
				transferDomainUrl={ this.getTransferDomainUrl() }
				useYourDomainUrl={ this.getUseYourDomainUrl() }
				onAddMapping={ this.handleAddMapping.bind( this, 'domainForm' ) }
				onSave={ this.handleSave.bind( this, 'domainForm' ) }
				offerUnavailableOption={ ! this.props.isDomainOnly }
				analyticsSection="signup"
				domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
				includeWordPressDotCom={ ! this.props.isDomainOnly && ! this.isDomainForAtomicSite() }
				includeDotBlogSubdomain={ this.shouldIncludeDotBlogSubdomain() }
				isSignupStep
				showExampleSuggestions
				surveyVertical={ this.props.surveyVertical }
				suggestion={ get( this.props, 'queryObject.new', '' ) }
				designType={ this.getDesignType() }
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
					initialState={ initialState }
					path={ this.props.path }
					onRegisterDomain={ this.handleAddDomain }
					onMapDomain={ this.handleAddMapping.bind( this, 'mappingForm' ) }
					onSave={ this.handleSave.bind( this, 'mappingForm' ) }
					products={ productsList.get() }
					domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
					initialQuery={ initialQuery }
					analyticsSection="signup"
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
					analyticsSection="signup"
					basePath={ this.props.path }
					domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
					initialQuery={ initialQuery }
					isSignupStep
					mapDomainUrl={ this.getMapDomainUrl() }
					onRegisterDomain={ this.handleAddDomain }
					onTransferDomain={ this.handleAddTransfer }
					onSave={ this.onTransferSave }
					products={ productsList.get() }
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
					analyticsSection="signup"
					basePath={ this.props.path }
					domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
					initialQuery={ initialQuery }
					isSignupStep
					mapDomainUrl={ this.getMapDomainUrl() }
					transferDomainUrl={ this.getTransferDomainUrl() }
					products={ productsList.get() }
				/>
			</div>
		);
	};

	getSubHeaderText() {
		const { translate } = this.props;
		return 'transfer' === this.props.stepSectionName || 'mapping' === this.props.stepSectionName
			? translate( 'Use a domain you already own with your new WordPress.com site.' )
			: translate(
					"Enter your site's name, or some keywords that describe it - " +
						"we'll use this to create your new site's address."
			  );
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

		if ( ! this.props.stepSectionName ) {
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

		return content;
	}

	render() {
		const { translate } = this.props;
		const backUrl = this.props.stepSectionName
			? getStepUrl( this.props.flowName, this.props.stepName, undefined, getLocaleSlug() )
			: undefined;

		const fallbackSubHeaderText = this.getSubHeaderText();

		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				backUrl={ backUrl }
				positionInFlow={ this.props.positionInFlow }
				signupProgress={ this.props.signupProgress }
				fallbackHeaderText={ translate( "Let's give your site an address." ) }
				fallbackSubHeaderText={ fallbackSubHeaderText }
				stepContent={
					<ReactCSSTransitionGroup
						component="div"
						transitionEnterTimeout={ 200 }
						transitionLeave={ false }
						transitionName="domains__step-content"
					>
						{ this.renderContent() }
					</ReactCSSTransitionGroup>
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
	state => ( {
		designType: getDesignType( state ),
		// no user = DOMAINS_WITH_PLANS_ONLY
		domainsWithPlansOnly: getCurrentUser( state )
			? currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY )
			: true,
		siteGoals: getSiteGoals( state ),
		surveyVertical: getSurveyVertical( state ),
	} ),
	{
		recordAddDomainButtonClick,
		recordAddDomainButtonClickInMapDomain,
		recordAddDomainButtonClickInTransferDomain,
		recordAddDomainButtonClickInUseYourDomain,
		submitDomainStepSelection,
		setDesignType,
	}
)( localize( DomainsStep ) );
