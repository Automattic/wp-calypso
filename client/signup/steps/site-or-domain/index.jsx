import { SelectItems } from '@automattic/onboarding';
import { globe, addCard, layout } from '@wordpress/icons';
import i18n, { localize } from 'i18n-calypso';
import { get, isEmpty } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import HeaderImage from 'calypso/assets/images/domains/domain.svg';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { getUserSiteCountForPlatform } from 'calypso/components/site-selector/utils';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';
import { getDomainProductSlug } from 'calypso/lib/domains';
import { preventWidows } from 'calypso/lib/formatting';
import StepWrapper from 'calypso/signup/step-wrapper';
import { isUserLoggedIn, getCurrentUser } from 'calypso/state/current-user/selectors';
import { getAvailableProductsList } from 'calypso/state/products-list/selectors';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import SiteOrDomainChoice from './choice';
import DomainImage from './domain-image';
import ExistingSiteImage from './existing-site-image';
import NewSiteImage from './new-site-image';
import './style.scss';

class SiteOrDomain extends Component {
	getDomainName() {
		const { signupDependencies } = this.props;
		let isValidDomain = false;
		const domain = get( signupDependencies, 'domainItem.meta', false );

		if ( domain ) {
			if ( domain.split( '.' ).length > 1 ) {
				const productSlug = getDomainProductSlug( domain );
				isValidDomain = !! this.props.productsList[ productSlug ];
			}
		}

		return isValidDomain && domain;
	}

	isLeanDomainSearch() {
		const { signupDependencies } = this.props;
		return 'leandomainsearch' === signupDependencies?.refParameter;
	}

	getChoices() {
		const { translate, isReskinned, isLoggedIn, siteCount } = this.props;

		const domainName = this.getDomainName();
		let buyADomainTitle = translate( 'Just buy a domain' );

		if ( this.isLeanDomainSearch() && domainName ) {
			// translators: %s is a domain name
			buyADomainTitle = translate( 'Just buy %s', { args: [ domainName ] } );
		}

		const choices = [];

		const buyADomainDescription =
			i18n.getLocaleSlug() === 'en' || i18n.hasTranslation( 'Add a site later.' )
				? translate( 'Add a site later.' )
				: translate( 'Show a "coming soon" notice on your domain. Add a site later.' );

		if ( isReskinned ) {
			choices.push( {
				key: 'domain',
				title: buyADomainTitle,
				description: buyADomainDescription,
				icon: globe,
				value: 'domain',
				actionText: translate( 'Get domain' ),
			} );
			choices.push( {
				key: 'page',
				title: translate( 'New site' ),
				description: translate(
					'Customize and launch your site.{{br/}}{{strong}}Free domain for the first year*{{/strong}}',
					{
						components: {
							strong: <strong />,
							br: <br />,
						},
					}
				),
				icon: addCard,
				value: 'page',
				actionText: translate( 'Start site' ),
			} );
			if ( isLoggedIn && siteCount > 0 ) {
				choices.push( {
					key: 'existing-site',
					title: translate( 'Existing WordPress.com site' ),
					description: translate(
						'Use with a site you already started.{{br/}}{{strong}}Free domain for the first year*{{/strong}}',
						{
							components: {
								strong: <strong />,
								br: <br />,
							},
						}
					),
					icon: layout,
					value: 'existing-site',
					actionText: translate( 'Choose site' ),
				} );
			}
		} else {
			choices.push( {
				type: 'page',
				label: translate( 'New site' ),
				image: <NewSiteImage />,
				description: translate(
					'Choose a theme, customize, and launch your site. A free domain for one year is included with all annual plans.'
				),
			} );
			if ( isLoggedIn && siteCount > 0 ) {
				choices.push( {
					type: 'existing-site',
					label: translate( 'Existing WordPress.com site' ),
					image: <ExistingSiteImage />,
					description: translate(
						'Use with a site you already started. A free domain for one year is included with all annual plans.'
					),
				} );
			}
			choices.push( {
				type: 'domain',
				label: buyADomainTitle,
				image: <DomainImage />,
				description: buyADomainDescription,
			} );
		}

		return choices;
	}

	renderChoices() {
		const { isReskinned, translate } = this.props;

		return (
			<div className="site-or-domain__choices">
				{ isReskinned ? (
					<>
						<div>
							<SelectItems
								items={ this.getChoices() }
								onSelect={ this.handleClickChoice }
								preventWidows={ preventWidows }
							/>
						</div>
						<div className="site-or-domain__free-domain-note">
							{ translate( '*A free domain for one year is included with all paid annual plans.' ) }
						</div>
					</>
				) : (
					<>
						{ this.getChoices().map( ( choice, index ) => (
							<SiteOrDomainChoice
								choice={ choice }
								handleClickChoice={ this.handleClickChoice }
								isPlaceholder={ ! this.props.productsLoaded }
								key={ `site-or-domain-choice-${ index }` }
							/>
						) ) }
					</>
				) }
			</div>
		);
	}

	renderScreen() {
		return (
			<div>
				{ ! this.props.productsLoaded && <QueryProductsList /> }
				{ this.renderChoices() }
			</div>
		);
	}

	submitDomain( designType ) {
		const { stepName } = this.props;

		const domain = this.getDomainName();
		const productSlug = getDomainProductSlug( domain );
		const domainItem = domainRegistration( { productSlug, domain } );
		const siteUrl = domain;

		this.props.submitSignupStep(
			{
				stepName,
				domainItem,
				designType,
				siteSlug: domain,
				siteUrl,
				isPurchasingItem: true,
			},
			{ designType, domainItem, siteUrl }
		);
	}

	submitDomainOnlyChoice() {
		const { goToStep } = this.props;

		// we can skip the next two steps in the `domain-first` flow if the
		// user is only purchasing a domain
		this.props.submitSignupStep( { stepName: 'site-picker', wasSkipped: true } );
		this.props.submitSignupStep(
			{ stepName: 'themes', wasSkipped: true },
			{ themeSlugWithRepo: 'pub/twentysixteen' }
		);
		this.props.submitSignupStep(
			{ stepName: 'plans-site-selected', wasSkipped: true },
			{ cartItem: null }
		);
		goToStep( 'user' );
	}

	handleClickChoice = ( designType ) => {
		const { goToStep, goToNextStep } = this.props;

		this.submitDomain( designType );

		if ( designType === 'domain' ) {
			this.submitDomainOnlyChoice();
		} else if ( designType === 'existing-site' ) {
			goToNextStep();
		} else {
			this.props.submitSignupStep( { stepName: 'site-picker', wasSkipped: true } );
			this.props.submitSignupStep(
				{ stepName: 'themes', wasSkipped: true },
				{ themeSlugWithRepo: 'pub/twentysixteen' }
			);
			goToStep( 'plans-site-selected' );
		}
	};

	render() {
		const { translate, productsLoaded, isReskinned } = this.props;
		const domainName = this.getDomainName();

		if ( productsLoaded && ! domainName ) {
			const headerText = translate( 'Unsupported domain.' );
			const subHeaderText = translate(
				'Please visit {{a}}wordpress.com/domains{{/a}} to search for a domain.',
				{
					components: {
						a: <a href="https://wordpress.com/domains/" />,
					},
				}
			);

			return (
				<StepWrapper
					flowName={ this.props.flowName }
					stepName={ this.props.stepName }
					positionInFlow={ this.props.positionInFlow }
					fallbackHeaderText={ headerText }
					fallbackSubHeaderText={ subHeaderText }
				/>
			);
		}

		const additionalProps = {};
		let headerText = this.props.headerText;

		if ( isReskinned ) {
			additionalProps.isHorizontalLayout = true;
			additionalProps.align = 'left';
			additionalProps.headerImageUrl = HeaderImage;
		}

		if ( this.isLeanDomainSearch() ) {
			additionalProps.className = 'lean-domain-search';
			if ( domainName ) {
				// translators: %s is a domain name
				headerText = translate( 'Choose how to use %s', { args: [ domainName ] } );
			}
		}

		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				headerText={ headerText }
				subHeaderText={ this.props.subHeaderText }
				fallbackHeaderText={ headerText }
				fallbackSubHeaderText={ this.props.subHeaderText }
				stepContent={ this.renderScreen() }
				{ ...additionalProps }
			/>
		);
	}
}

export default connect(
	( state ) => {
		const productsList = getAvailableProductsList( state );
		const productsLoaded = ! isEmpty( productsList );
		const user = getCurrentUser( state );

		return {
			isLoggedIn: isUserLoggedIn( state ),
			productsList,
			productsLoaded,
			siteCount: getUserSiteCountForPlatform( user ),
		};
	},
	{ submitSignupStep }
)( localize( SiteOrDomain ) );
