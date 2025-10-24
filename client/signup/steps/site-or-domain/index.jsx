import config from '@automattic/calypso-config';
import { Gridicon } from '@automattic/components';
import { SelectItems } from '@automattic/onboarding';
import { globe, addCard, layout } from '@wordpress/icons';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import { getUserSiteCountForPlatform } from 'calypso/components/site-selector/utils';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';
import { getDomainProductSlug } from 'calypso/lib/domains';
import { preventWidows } from 'calypso/lib/formatting';
import StepWrapper from 'calypso/signup/step-wrapper';
import { isUserLoggedIn, getCurrentUser } from 'calypso/state/current-user/selectors';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';

import './style.scss';

class SiteOrDomain extends Component {
	getDomainName() {
		const domainCart = this.getDomainCart();
		if ( domainCart.length ) {
			return domainCart[ 0 ].meta;
		}

		return false;
	}

	getDomainCart() {
		const { signupDependencies } = this.props;
		const domainCart = signupDependencies?.domainCart ?? [];

		return domainCart;
	}

	isLeanDomainSearch() {
		const { signupDependencies } = this.props;
		return 'leandomainsearch' === signupDependencies?.refParameter;
	}

	getChoices() {
		const { translate, isLoggedIn, siteCount } = this.props;

		const domainName = this.getDomainName();
		let buyADomainTitle = translate( 'Just buy a domain', 'Just buy domains', {
			count: this.getDomainCart().length,
		} );
		if ( this.isLeanDomainSearch() && domainName ) {
			// translators: %s is a domain name
			buyADomainTitle = translate( 'Just buy %s', { args: [ domainName ] } );
		}
		const buyADomainDescription = translate( 'Add a site later.' );

		const newSiteTitle = translate( 'New site' );
		const newSiteDescription = translate(
			'Customize and launch your site. Free domain for the first year on annual plans.',
			{
				comment: 'Description for new site option, periods added for screen reader pause',
			}
		);
		const newSiteVisualDescription = translate(
			'Customize and launch your site.{{br/}}{{strong}}Free domain for the first year on annual plans.{{/strong}}',
			{
				components: {
					strong: <strong />,
					br: <br aria-hidden="true" />,
				},
			}
		);

		const existingSiteTitle = translate( 'Existing WordPress.com site' );
		const existingSiteDescription = translate(
			'Use the domain with a site you already started. Free domain for the first year on annual plans.'
		);
		const existingSiteVisualDescription = translate(
			'Use the domain with a site you already started.{{br/}}{{strong}}Free domain for the first year on annual plans.{{/strong}}',
			{
				components: {
					strong: <strong />,
					br: <br aria-hidden="true" />,
				},
			}
		);

		const choices = [];

		choices.push( {
			key: 'domain',
			title: buyADomainTitle,
			description: buyADomainDescription,
			icon: null,
			titleIcon: globe,
			value: 'domain',
			actionText: <Gridicon icon="chevron-right" size={ 18 } aria-hidden="true" />,
			actionButtonLabel: translate( 'Select %(title)s', {
				args: { title: buyADomainTitle },
			} ),
			allItemClickable: true,
			'aria-label': `${ buyADomainTitle }. ${ buyADomainDescription }`,
		} );
		choices.push( {
			key: 'page',
			title: newSiteTitle,
			description: newSiteVisualDescription,
			icon: null,
			titleIcon: addCard,
			value: 'page',
			actionText: <Gridicon icon="chevron-right" size={ 18 } aria-hidden="true" />,
			actionButtonLabel: translate( 'Select %(title)s', {
				args: { title: newSiteTitle },
			} ),
			allItemClickable: true,
			'aria-label': `${ newSiteTitle }. ${ newSiteDescription }`,
		} );
		if ( isLoggedIn && siteCount > 0 ) {
			choices.push( {
				key: 'existing-site',
				title: existingSiteTitle,
				description: existingSiteVisualDescription,
				icon: null,
				titleIcon: layout,
				value: 'existing-site',
				actionText: <Gridicon icon="chevron-right" size={ 18 } aria-hidden="true" />,
				actionButtonLabel: translate( 'Select %(title)s', {
					args: { title: existingSiteTitle },
				} ),
				allItemClickable: true,
				'aria-label': `${ existingSiteTitle }. ${ existingSiteDescription }`,
			} );
		}

		return choices;
	}

	renderChoices() {
		return (
			<div className="site-or-domain__choices">
				<SelectItems
					items={ this.getChoices() }
					onSelect={ this.handleClickChoice }
					preventWidows={ preventWidows }
				/>
			</div>
		);
	}

	renderScreen() {
		return <div>{ this.renderChoices() }</div>;
	}

	submitDomain( designType ) {
		const { stepName } = this.props;

		const domain = this.getDomainName();
		const domainCart = this.getDomainCart();
		const productSlug = getDomainProductSlug( domain );
		const domainItem = domainRegistration( {
			productSlug,
			domain,
			extra: { flow_name: this.props.flowName },
		} );
		const siteUrl = domain;

		this.props.submitSignupStep(
			{
				stepName,
				domainItem,
				designType,
				siteSlug: domain,
				siteUrl,
				isPurchasingItem: true,
				domainCart,
			},
			{ designType, domainItem, siteUrl, domainCart }
		);
	}

	submitDomainOnlyChoice() {
		const { goToStep } = this.props;

		const domainCart = this.getDomainCart();
		// we can skip the next two steps in the `domain-first` flow if the
		// user is only purchasing a domain
		this.props.submitSignupStep(
			{ stepName: 'site-picker', wasSkipped: true, domainCart },
			{ themeSlugWithRepo: 'pub/twentysixteen' }
		);
		this.props.submitSignupStep(
			{ stepName: 'plans-site-selected', wasSkipped: true },
			{ cartItems: null }
		);
		goToStep( config.isEnabled( 'signup/social-first' ) ? 'user-social' : 'user' );
	}

	handleClickChoice = ( designType ) => {
		const { goToStep, goToNextStep } = this.props;
		const domainCart = this.getDomainCart();

		this.submitDomain( designType );

		if ( designType === 'domain' ) {
			this.submitDomainOnlyChoice();
		} else if ( designType === 'existing-site' ) {
			goToNextStep();
		} else {
			this.props.submitSignupStep(
				{ stepName: 'site-picker', wasSkipped: true, domainCart },
				{ themeSlugWithRepo: 'pub/twentysixteen' }
			);
			goToStep( 'plans-site-selected' );
		}
	};

	render() {
		const { translate } = this.props;
		const domainName = this.getDomainName();

		if ( ! domainName ) {
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
		let headerText = this.props.getHeaderText( this.getDomainCart() );

		additionalProps.isHorizontalLayout = false;
		additionalProps.align = 'center';

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
		const user = getCurrentUser( state );

		return {
			isLoggedIn: isUserLoggedIn( state ),
			siteCount: getUserSiteCountForPlatform( user ),
		};
	},
	{ submitSignupStep }
)( localize( SiteOrDomain ) );
