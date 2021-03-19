/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import config from '@automattic/calypso-config';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import page from 'page';

/**
 * Internal dependencies
 */
import { areAllUsersValid, getItemsForCart, newUsers } from 'calypso/lib/gsuite/new-users';
import PromoCard from 'calypso/components/promo-section/promo-card';
import EmailProviderCard from './email-provider-card';
import EmailProviderDetails from './email-provider-details';
import EmailProviderFeature from './email-provider-details/email-provider-feature';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormPasswordInput from 'calypso/components/forms/form-password-input';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
import { getProductBySlug, getProductsList } from 'calypso/state/products-list/selectors';
import {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
	GSUITE_BASIC_SLUG,
} from 'calypso/lib/gsuite/constants';
import { TITAN_MAIL_MONTHLY_SLUG } from 'calypso/lib/titan/constants';
import { getAnnualPrice, getGoogleMailServiceFamily, getMonthlyPrice } from 'calypso/lib/gsuite';
import { hasDiscount } from 'calypso/components/gsuite/gsuite-price';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import GSuiteNewUserList from 'calypso/components/gsuite/gsuite-new-user-list';
import {
	emailManagementForwarding,
	emailManagementNewGSuiteAccount,
	emailManagementNewTitanAccount,
} from 'calypso/my-sites/email/paths';
import wpcom from 'calypso/lib/wp';
import { errorNotice } from 'calypso/state/notices/actions';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import Gridicon from 'calypso/components/gridicon';
import formatCurrency from '@automattic/format-currency';
import emailIllustration from 'calypso/assets/images/email-providers/email-illustration.svg';
import titanLogo from 'calypso/assets/images/email-providers/titan.svg';
import poweredByTitanLogo from 'calypso/assets/images/email-providers/titan/powered-by-titan.svg';
import googleWorkspaceIcon from 'calypso/assets/images/email-providers/google-workspace/icon.svg';
import gSuiteLogo from 'calypso/assets/images/email-providers/gsuite.svg';
import forwardingIcon from 'calypso/assets/images/email-providers/forwarding.svg';
import { getTitanProductName } from 'calypso/lib/titan';
import { withShoppingCart } from '@automattic/shopping-cart';

/**
 * Style dependencies
 */
import './style.scss';

class EmailProvidersComparison extends React.Component {
	static propTypes = {
		domain: PropTypes.object.isRequired,
		isGSuiteSupported: PropTypes.bool.isRequired,
	};

	state = {
		googleUsers: [],
		isFetchingProvisioningURL: false,
		titanUsers: [],
		expanded: {
			forwarding: false,
			google: false,
			titan: true,
		},
	};

	isMounted = false;

	componentDidMount() {
		this.isMounted = true;
	}

	componentWillUnmount() {
		this.isMounted = false;
	}

	onExpandedStateChange = ( providerKey, isExpanded ) => {
		const expanded = Object.assign(
			{},
			this.state.expanded,
			Object.fromEntries( [ [ providerKey, isExpanded ] ] )
		);
		this.setState( { expanded } );
	};

	goToEmailForwarding = () => {
		const { domain, currentRoute, selectedSiteSlug } = this.props;
		recordTracksEvent( 'calypso_email_providers_add_click', { provider: 'email-forwarding' } );
		page( emailManagementForwarding( selectedSiteSlug, domain.name, currentRoute ) );
	};

	goToAddGSuite = () => {
		const { domain, currentRoute, selectedSiteSlug } = this.props;

		recordTracksEvent( 'calypso_email_providers_add_click', { provider: 'gsuite' } );

		const planType = config.isEnabled( 'google-workspace-migration' ) ? 'starter' : 'basic';

		page(
			emailManagementNewGSuiteAccount( selectedSiteSlug, domain.name, planType, currentRoute )
		);
	};

	onAddTitanClick = () => {
		recordTracksEvent( 'calypso_email_providers_add_click', { provider: 'titan' } );

		if ( config.isEnabled( 'titan/phase-2' ) ) {
			const { domain, currentRoute, selectedSiteSlug } = this.props;
			page( emailManagementNewTitanAccount( selectedSiteSlug, domain.name, currentRoute ) );
		} else {
			if ( this.state.isFetchingProvisioningURL ) {
				return;
			}

			const { domain, translate } = this.props;
			this.setState( { isFetchingProvisioningURL: true } );
			this.fetchTitanOrderProvisioningURL( domain.name ).then( ( { error, provisioningURL } ) => {
				this.setState( { isFetchingProvisioningURL: false } );
				if ( error ) {
					this.props.errorNotice(
						translate( 'An unknown error occurred. Please try again later.' )
					);
				} else {
					window.location.href = provisioningURL;
				}
			} );
		}
	};

	fetchTitanOrderProvisioningURL = ( domain ) => {
		return new Promise( ( resolve ) => {
			wpcom.undocumented().getTitanOrderProvisioningURL( domain, ( serverError, result ) => {
				resolve( {
					error: serverError,
					provisioningURL: serverError ? null : result.provisioning_url,
				} );
			} );
		} );
	};

	renderHeaderSection() {
		const { domain, translate } = this.props;
		const image = {
			path: emailIllustration,
			align: 'right',
		};

		const translateArgs = {
			args: {
				domainName: domain.name,
			},
			comment: '%(domainName)s is the domain name, e.g example.com',
		};

		return (
			<PromoCard
				isPrimary
				title={ translate( 'Get your own @%(domainName)s email address', translateArgs ) }
				image={ image }
				className="email-providers-comparison__action-panel"
			>
				<p>
					{ translate(
						'Pick one of our flexible options to connect your domain with email ' +
							'and start getting emails @%(domainName)s today.',
						translateArgs
					) }
				</p>
			</PromoCard>
		);
	}

	renderForwardingDetails( className ) {
		const { domain, translate } = this.props;

		const buttonLabel =
			domain.emailForwardsCount > 0
				? translate( 'Manage email forwarding' )
				: translate( 'Add email forwarding' );

		return (
			<EmailProviderDetails
				title={ translate( 'Email Forwarding' ) }
				description={ translate(
					'Use your custom domain in your email address and forward all your mail to another address.'
				) }
				image={ { path: forwardingIcon } }
				features={ this.getForwardingFeatures() }
				buttonLabel={ buttonLabel }
				onButtonClick={ this.goToEmailForwarding }
				className={ className }
			/>
		);
	}

	renderTitanDetails( className ) {
		const { currencyCode, titanMailProduct, translate } = this.props;

		const formattedPrice = config.isEnabled( 'titan/phase-2' )
			? translate( '{{price/}} /user /month', {
					components: {
						price: <span>{ formatCurrency( titanMailProduct?.cost ?? 0, currencyCode ) }</span>,
					},
					comment: '{{price/}} is the formatted price, e.g. $20',
			  } )
			: translate( '{{price/}} /user /month', {
					components: {
						price: <span>{ formatCurrency( 3.5, 'USD' ) }</span>,
					},
					comment: '{{price/}} is the formatted price, e.g. $20',
			  } );
		const providerName = getTitanProductName();
		const providerCtaText = translate( 'Add %(emailProductName)s', {
			args: {
				emailProductName: providerName,
			},
			comment: '%(emailProductName)s is the product name, either "Email" or "Titan Mail"',
		} );
		const providerEmailLogo = config.isEnabled( 'titan/phase-2' ) ? (
			<Gridicon
				className="email-providers-comparison__providers-wordpress-com-email"
				icon="my-sites"
			/>
		) : (
			{ path: titanLogo }
		);
		const badge = config.isEnabled( 'titan/phase-2' ) ? (
			<img src={ poweredByTitanLogo } alt={ translate( 'Powered by Titan' ) } />
		) : null;

		return (
			<EmailProviderDetails
				title={ providerName }
				description={ translate(
					'Easy-to-use email with incredibly powerful features. Manage your email and more on any device.'
				) }
				image={ providerEmailLogo }
				features={ this.getTitanFeatures() }
				formattedPrice={ formattedPrice }
				buttonLabel={ providerCtaText }
				hasPrimaryButton={ true }
				isButtonBusy={ this.state.isFetchingProvisioningURL }
				onButtonClick={ this.onAddTitanClick }
				badge={ badge }
				className={ classNames( className, 'titan' ) }
			/>
		);
	}

	renderGSuiteDetails( className ) {
		const gsuiteProps = this.getGoogleDetailProps();

		return (
			<EmailProviderDetails
				image={ { path: gsuiteProps.productLogo } }
				features={ this.getGoogleFeatures() }
				onButtonClick={ this.goToAddGSuite }
				className={ classNames( className, 'gsuite' ) }
				{ ...gsuiteProps }
			/>
		);
	}

	getGoogleDetailProps() {
		const { currencyCode, gSuiteProduct, translate } = this.props;

		const priceArguments = {
			components: {
				price: <span>{ getMonthlyPrice( gSuiteProduct?.cost ?? null, currencyCode ) }</span>,
			},
			comment: '{{price/}} is the formatted price, e.g. $20',
		};
		const formattedPrice = config.isEnabled( 'email/centralized-home' )
			? translate( '{{price/}} /user /month billed annually', priceArguments )
			: translate( '{{price/}} /user /month', priceArguments );
		return {
			title: getGoogleMailServiceFamily(),
			description: translate(
				'Professional email integrated with Google Meet and other collaboration tools from Google.'
			),
			productLogo: config.isEnabled( 'google-workspace-migration' )
				? googleWorkspaceIcon
				: gSuiteLogo,
			buttonLabel: translate( 'Add %(googleMailService)s', {
				args: {
					googleMailService: getGoogleMailServiceFamily(),
				},
				comment: '%(googleMailService)s can be either "G Suite" or "Google Workspace"',
			} ),
			formattedPrice: formattedPrice,
			discount: hasDiscount( gSuiteProduct )
				? translate( 'First year %(discountedPrice)s', {
						args: {
							discountedPrice: getAnnualPrice( gSuiteProduct.sale_cost, currencyCode ),
						},
						comment: '%(discountedPrice)s is a formatted price, e.g. $75',
				  } )
				: null,
			additionalPriceInformation: translate( '%(price)s billed annually', {
				args: {
					price: getAnnualPrice( gSuiteProduct?.cost ?? null, currencyCode ),
				},
				comment: "Annual price formatted with the currency (e.g. '$99.99')",
			} ),
		};
	}

	getForwardingFeatures() {
		const { translate } = this.props;

		return [ translate( 'No billing' ), translate( 'Receive emails sent to your custom domain' ) ];
	}

	getGoogleFeatures() {
		const { translate } = this.props;

		return [
			translate( 'Annual billing' ),
			translate( 'Send and receive from your custom domain' ),
			translate( '30GB storage' ),
			translate( 'Email, calendars, and contacts' ),
			translate( 'Video calls, docs, spreadsheets, and more' ),
			translate( 'Work from anywhere on any device – even offline' ),
		];
	}

	getTitanFeatures() {
		const { translate } = this.props;

		return [
			translate( 'Monthly billing' ),
			translate( 'Send and receive from your custom domain' ),
			translate( '30GB storage' ),
			translate( 'Email, calendars, and contacts' ),
			translate( 'One-click import of existing emails and contacts' ),
		];
	}

	renderStackedTitanDetails() {
		const { currencyCode, domain, titanMailProduct, translate } = this.props;

		const formattedPrice = translate( '{{price/}} /user /month billed monthly', {
			components: {
				price: <span>{ formatCurrency( titanMailProduct?.cost ?? 0, currencyCode ) }</span>,
			},
			comment: '{{price/}} is the formatted price, e.g. $20',
		} );
		// TODO: calculate whether a discount/trial applies for the current domain
		const discount = translate( '3 months free' );
		const logo = (
			<Gridicon
				className="email-providers-comparison__providers-wordpress-com-email"
				icon="my-sites"
			/>
		);
		const poweredByTitan = (
			<img src={ poweredByTitanLogo } alt={ translate( 'Powered by Titan' ) } />
		);

		const formFields = (
			<>
				<FormFieldset>
					<FormLabel>
						{ translate( 'Email address' ) }
						<FormTextInputWithAffixes
							required
							suffix={ `@${ domain.name }` }
							onChange={ this.onTitanEmailChange }
						/>
					</FormLabel>
				</FormFieldset>
				<FormFieldset>
					<FormLabel>
						{ translate( 'Password' ) }
						<FormPasswordInput required onChange={ this.onTitanPasswordChange } />
					</FormLabel>
				</FormFieldset>
			</>
		);

		return (
			<EmailProviderCard
				providerKey="titan"
				logo={ logo }
				title={ translate( 'Email' ) }
				badge={ poweredByTitan }
				description={ translate(
					'Easy-to-use email with incredibly powerful features. Manage your email and more on any device.'
				) }
				detailsExpanded={ this.state.expanded.titan }
				onExpandedChange={ this.onExpandedStateChange }
				formattedPrice={ formattedPrice }
				discount={ discount }
				formFields={ formFields }
				buttonLabel={ translate( 'Add Email' ) }
				onButtonClick={ this.onAddTitanClick }
				features={ this.getTitanFeatures() }
			/>
		);
	}

	onGoogleUsersChange = ( changedUsers ) => {
		this.setState( { googleUsers: changedUsers } );
	};

	onGoogleFormReturnKeyPress = ( event ) => {
		// Simulate an implicit submission user form :)
		if ( event.key === 'Enter' ) {
			this.onGoogleConfirmUsers();
		}
	};

	onGoogleConfirmNewUsers = () => {
		const { googleUsers } = this.state;

		const usersAreValid = areAllUsersValid( googleUsers );
		if ( ! usersAreValid ) {
			return;
		}

		const { domain, productsList, selectedSiteSlug, shoppingCartManager } = this.props;
		const domains = [ domain ];
		const googleProductSlug = config.isEnabled( 'google-workspace-migration' )
			? GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY
			: GSUITE_BASIC_SLUG;

		shoppingCartManager
			.addProductsToCart(
				getItemsForCart( domains, googleProductSlug, googleUsers ).map( ( item ) =>
					fillInSingleCartItemAttributes( item, productsList )
				)
			)
			.then( () => {
				this.isMounted && page( '/checkout/' + selectedSiteSlug );
			} );
	};

	renderStackedGoogleDetails() {
		const { domain, isGSuiteSupported } = this.props;

		if ( ! isGSuiteSupported ) {
			return null;
		}

		const googleProps = this.getGoogleDetailProps();
		// If we don't have any users, initialize the list to have 1 empty user
		const googleUsers =
			( this.state.googleUsers ?? [] ).length === 0
				? newUsers( domain.name )
				: this.state.googleUsers;

		const formFields = (
			<FormFieldset>
				<GSuiteNewUserList
					extraValidation={ ( user ) => user }
					domains={ [ domain ] }
					onUsersChange={ this.onGoogleUsersChange }
					selectedDomainName={ domain.name }
					users={ googleUsers }
					onReturnKeyPress={ this.onGoogleFormReturnKeyPress }
				/>
			</FormFieldset>
		);

		return (
			<EmailProviderCard
				providerKey="google"
				logo={ { path: googleProps.productLogo } }
				formFields={ formFields }
				detailsExpanded={ this.state.expanded.google }
				onExpandedChange={ this.onExpandedStateChange }
				onButtonClick={ this.onGoogleConfirmNewUsers }
				buttonDisabled={ ! areAllUsersValid( googleUsers ) }
				features={ this.getGoogleFeatures() }
				{ ...googleProps }
			/>
		);
	}

	renderStackedForwardingDetails() {
		const { domain, translate } = this.props;

		const formFields = (
			<>
				<FormFieldset>
					<FormLabel>
						{ translate( 'Emails sent to' ) }
						<FormTextInputWithAffixes
							required
							suffix={ `@${ domain.name }` }
							onChange={ this.onForwardingEmailChange }
						/>
					</FormLabel>
				</FormFieldset>
				<FormFieldset>
					<FormLabel>
						{ translate( 'Will be forwarded to' ) }
						<FormTextInput required onChange={ this.onForwardingRecipientEmailChange } />
					</FormLabel>
				</FormFieldset>
			</>
		);

		return (
			<EmailProviderCard
				providerKey="forwarding"
				logo={ { path: forwardingIcon } }
				title={ translate( 'Email Forwarding' ) }
				description={ translate(
					'Use your custom domain in your email address and forward all your mail to another address.'
				) }
				detailsExpanded={ this.state.expanded.forwarding }
				onExpandedChange={ this.onExpandedStateChange }
				formFields={ formFields }
				buttonLabel={ translate( 'Add email forwarding' ) }
				onButtonClick={ this.goToEmailForwarding }
				features={ this.getForwardingFeatures() }
			/>
		);
	}

	onForwardingEmailChange = () => {
		// TODO: Validate the local email address
	};

	onForwardingRecipientEmailChange = () => {
		// TODO: Validate the receiving email address
	};

	renderFeatures( provider, features ) {
		return features.map( ( feature, index ) => (
			<EmailProviderFeature key={ `feature-${ provider }-${ index }` } title={ feature } />
		) );
	}

	renderStackedDesign() {
		return (
			<>
				{ this.renderStackedTitanDetails() }
				{ this.renderStackedGoogleDetails() }
				{ this.renderStackedForwardingDetails() }
			</>
		);
	}

	render() {
		const { isGSuiteSupported } = this.props;
		const isTitanSupported = config.isEnabled( 'titan/phase-2' );
		const cardClassName = classNames( [
			isGSuiteSupported ? null : 'no-gsuite',
			isTitanSupported ? null : 'no-titan',
		] );

		if ( config.isEnabled( 'email/centralized-home' ) ) {
			return (
				<>
					{ this.renderHeaderSection() }
					{ this.renderStackedDesign() }
				</>
			);
		}

		return (
			<>
				{ this.renderHeaderSection() }
				<div className="email-providers-comparison__providers">
					{ this.renderForwardingDetails( cardClassName ) }
					{ isTitanSupported && this.renderTitanDetails( cardClassName ) }
					{ isGSuiteSupported && this.renderGSuiteDetails( cardClassName ) }
					<TrackComponentView
						eventName="calypso_email_providers_comparison_page_view"
						eventProperties={ { is_gsuite_supported: isGSuiteSupported } }
					/>
				</div>
			</>
		);
	}
}

export default connect(
	( state ) => {
		const productSlug = config.isEnabled( 'google-workspace-migration' )
			? GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY
			: GSUITE_BASIC_SLUG;

		return {
			currencyCode: getCurrentUserCurrencyCode( state ),
			gSuiteProduct: getProductBySlug( state, productSlug ),
			titanMailProduct: getProductBySlug( state, TITAN_MAIL_MONTHLY_SLUG ),
			currentRoute: getCurrentRoute( state ),
			productsList: getProductsList( state ),
			selectedSiteSlug: getSelectedSiteSlug( state ),
		};
	},
	( dispatch ) => {
		return {
			errorNotice: ( text, options ) => dispatch( errorNotice( text, options ) ),
		};
	}
)( withShoppingCart( localize( EmailProvidersComparison ) ) );
