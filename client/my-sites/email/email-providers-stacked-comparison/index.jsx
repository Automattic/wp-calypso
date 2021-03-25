/**
 * External dependencies
 */
import React from 'react';
import config from '@automattic/calypso-config';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import {
	areAllMailboxesValid,
	buildNewTitanMailbox,
	transformMailboxForCart,
} from 'calypso/lib/titan/new-mailbox';
import { areAllUsersValid, getItemsForCart, newUsers } from 'calypso/lib/gsuite/new-users';
import { Button } from '@automattic/components';
import PromoCard from 'calypso/components/promo-section/promo-card';
import EmailProviderCard from './email-provider-card';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
import {
	getEmailForwardingFeatures,
	getGoogleFeatures,
	getTitanFeatures,
} from 'calypso/my-sites/email/email-providers-comparison/email-provider-features';
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
import { emailManagementForwarding } from 'calypso/my-sites/email/paths';
import { errorNotice } from 'calypso/state/notices/actions';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import Gridicon from 'calypso/components/gridicon';
import formatCurrency from '@automattic/format-currency';
import emailIllustration from 'calypso/assets/images/email-providers/email-illustration.svg';
import poweredByTitanLogo from 'calypso/assets/images/email-providers/titan/powered-by-titan.svg';
import googleWorkspaceIcon from 'calypso/assets/images/email-providers/google-workspace/icon.svg';
import gSuiteLogo from 'calypso/assets/images/email-providers/gsuite.svg';
import forwardingIcon from 'calypso/assets/images/email-providers/forwarding.svg';
import { titanMailMonthly } from 'calypso/lib/cart-values/cart-items';
import TitanNewMailboxList from 'calypso/my-sites/email/titan-mail-add-mailboxes/titan-new-mailbox-list';
import { withShoppingCart } from '@automattic/shopping-cart';

/**
 * Style dependencies
 */
import './style.scss';

const identityMap = ( item ) => item;

class EmailProvidersStackedComparison extends React.Component {
	static propTypes = {
		domain: PropTypes.object.isRequired,
		isGSuiteSupported: PropTypes.bool.isRequired,
	};

	state = {
		googleUsers: [],
		titanMailboxes: [ buildNewTitanMailbox( this.props.domain.name, false ) ],
		expanded: {
			forwarding: false,
			google: false,
			titan: true,
		},
		addingToCart: false,
	};

	isMounted = false;

	componentDidMount() {
		this.isMounted = true;
	}

	componentWillUnmount() {
		this.isMounted = false;
	}

	onExpandedStateChange = ( providerKey, isExpanded ) => {
		const expandedEntries = Object.entries( this.state.expanded ).map( ( entry ) => {
			const [ key, currentExpanded ] = entry;
			if ( isExpanded ) {
				return [ key, key === providerKey ];
			}
			return [ key, key === providerKey ? isExpanded : currentExpanded ];
		} );

		if ( isExpanded ) {
			recordTracksEvent( 'calypso_email_providers_expand_section_click', {
				provider: providerKey,
			} );
		}

		this.setState( { expanded: Object.fromEntries( expandedEntries ) } );
	};

	goToEmailForwarding = () => {
		const { domain, currentRoute, selectedSiteSlug } = this.props;

		recordTracksEvent( 'calypso_email_providers_add_click', { provider: 'email-forwarding' } );

		page( emailManagementForwarding( selectedSiteSlug, domain.name, currentRoute ) );
	};

	onTitanMailboxesChange = ( updatedMailboxes ) =>
		this.setState( { titanMailboxes: updatedMailboxes } );

	onTitanFormReturnKeyPress = ( event ) => {
		// Simulate form submission
		if ( event.key === 'Enter' ) {
			this.onTitanConfirmNewMailboxes();
		}
	};

	onTitanConfirmNewMailboxes = () => {
		const { titanMailboxes } = this.state;

		const mailboxesAreValid = areAllMailboxesValid( titanMailboxes, [ 'alternativeEmail' ] );

		recordTracksEvent( 'calypso_email_providers_add_click', {
			mailbox_count: titanMailboxes.length,
			mailboxes_valid: mailboxesAreValid ? 1 : 0,
			provider: 'titan',
		} );

		if ( ! mailboxesAreValid ) {
			return;
		}

		const { domain, productsList, selectedSiteSlug, shoppingCartManager } = this.props;

		const cartItem = titanMailMonthly( {
			domain: domain.name,
			quantity: titanMailboxes.length,
			extra: {
				email_users: titanMailboxes.map( transformMailboxForCart ),
				new_quantity: titanMailboxes.length,
			},
		} );

		this.setState( { addingToCart: true } );
		shoppingCartManager
			.addProductsToCart( [ fillInSingleCartItemAttributes( cartItem, productsList ) ] )
			.then( () => {
				if ( this.isMounted ) {
					this.setState( { addingToCart: false } );
				}
				const { errors } = this.props?.cart?.messages;
				if ( errors && errors.length ) {
					// Stay on the page to show the relevant error(s)
					return;
				}
				this.isMounted && page( '/checkout/' + selectedSiteSlug );
			} );
	};

	onGoogleUsersChange = ( changedUsers ) => {
		this.setState( { googleUsers: changedUsers } );
	};

	onGoogleFormReturnKeyPress = ( event ) => {
		// Simulate form submission
		if ( event.key === 'Enter' ) {
			this.onGoogleConfirmNewUsers();
		}
	};

	onGoogleConfirmNewUsers = () => {
		const { googleUsers } = this.state;

		const usersAreValid = areAllUsersValid( googleUsers );

		recordTracksEvent( 'calypso_email_providers_add_click', {
			mailbox_count: googleUsers.length,
			mailboxes_valid: usersAreValid ? 1 : 0,
			provider: 'google',
		} );

		if ( ! usersAreValid ) {
			return;
		}

		const { domain, productsList, selectedSiteSlug, shoppingCartManager } = this.props;
		const domains = [ domain ];
		const googleProductSlug = config.isEnabled( 'google-workspace-migration' )
			? GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY
			: GSUITE_BASIC_SLUG;

		this.setState( { addingToCart: true } );
		shoppingCartManager
			.addProductsToCart(
				getItemsForCart( domains, googleProductSlug, googleUsers ).map( ( item ) =>
					fillInSingleCartItemAttributes( item, productsList )
				)
			)
			.then( () => {
				if ( this.isMounted ) {
					this.setState( { addingToCart: false } );
				}
				const { errors } = this.props?.cart?.messages;
				if ( errors && errors.length ) {
					// Stay on the page to show the relevant error(s)
					return;
				}
				this.isMounted && page( '/checkout/' + selectedSiteSlug );
			} );
	};

	renderEmailForwardingCard() {
		const { domain, translate } = this.props;

		const buttonLabel =
			domain.emailForwardsCount > 0
				? translate( 'Manage email forwarding' )
				: translate( 'Add email forwarding' );

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
				buttonLabel={ buttonLabel }
				expandButtonLabel={ translate( 'Add email forwarding' ) }
				onButtonClick={ this.goToEmailForwarding }
				features={ getEmailForwardingFeatures() }
			/>
		);
	}

	renderGoogleCard() {
		const { currencyCode, domain, gSuiteProduct, isGSuiteSupported, translate } = this.props;

		// TODO: Improve handling of
		if ( ! isGSuiteSupported ) {
			return null;
		}

		const logoPath = config.isEnabled( 'google-workspace-migration' )
			? googleWorkspaceIcon
			: gSuiteLogo;

		const formattedPrice = translate( '{{price/}} /user /month billed annually', {
			components: {
				price: <span>{ getMonthlyPrice( gSuiteProduct?.cost ?? null, currencyCode ) }</span>,
			},
			comment: '{{price/}} is the formatted price, e.g. $20',
		} );
		const discount = hasDiscount( gSuiteProduct )
			? translate( 'First year %(discountedPrice)s', {
					args: {
						discountedPrice: getAnnualPrice( gSuiteProduct.sale_cost, currencyCode ),
					},
					comment: '%(discountedPrice)s is a formatted price, e.g. $75',
			  } )
			: null;
		const additionalPriceInformation = translate( '%(price)s billed annually', {
			args: {
				price: getAnnualPrice( gSuiteProduct?.cost ?? null, currencyCode ),
			},
			comment: "Annual price formatted with the currency (e.g. '$99.99')",
		} );

		// If we don't have any users, initialize the list to have 1 empty user
		const googleUsers =
			( this.state.googleUsers ?? [] ).length === 0
				? newUsers( domain.name )
				: this.state.googleUsers;

		const formFields = (
			<FormFieldset>
				<GSuiteNewUserList
					extraValidation={ identityMap }
					domains={ [ domain ] }
					onUsersChange={ this.onGoogleUsersChange }
					selectedDomainName={ domain.name }
					users={ googleUsers }
					onReturnKeyPress={ this.onGoogleFormReturnKeyPress }
				>
					<Button
						className="email-providers-stacked-comparison__gsuite-user-list-action-continue"
						primary
						busy={ this.state.addingToCart }
						onClick={ this.onGoogleConfirmNewUsers }
					>
						{ translate( 'Add %(googleMailService)s', {
							args: {
								googleMailService: getGoogleMailServiceFamily(),
							},
							comment: '%(googleMailService)s can be either "G Suite" or "Google Workspace"',
						} ) }
					</Button>
				</GSuiteNewUserList>
			</FormFieldset>
		);

		return (
			<EmailProviderCard
				providerKey="google"
				logo={ { path: logoPath } }
				title={ getGoogleMailServiceFamily() }
				description={ translate(
					'Professional email integrated with Google Meet and other collaboration tools from Google.'
				) }
				formattedPrice={ formattedPrice }
				discount={ discount }
				additionalPriceInformation={ additionalPriceInformation }
				formFields={ formFields }
				detailsExpanded={ this.state.expanded.google }
				onExpandedChange={ this.onExpandedStateChange }
				onButtonClick={ this.onGoogleConfirmNewUsers }
				expandButtonLabel={ translate( 'Add %(googleMailService)s', {
					args: {
						googleMailService: getGoogleMailServiceFamily(),
					},
					comment: '%(googleMailService)s can be either "G Suite" or "Google Workspace"',
				} ) }
				features={ getGoogleFeatures() }
			/>
		);
	}

	renderTitanCard() {
		const { currencyCode, domain, titanMailProduct, translate } = this.props;

		const formattedPrice = translate( '{{price/}} /user /month billed monthly', {
			components: {
				price: <span>{ formatCurrency( titanMailProduct?.cost ?? 0, currencyCode ) }</span>,
			},
			comment: '{{price/}} is the formatted price, e.g. $20',
		} );
		// TODO: calculate whether a discount/trial applies for the current domain
		const discount = null; //translate( '3 months free' );
		const logo = (
			<Gridicon
				className="email-providers-stacked-comparison__providers-wordpress-com-email"
				icon="my-sites"
			/>
		);
		const poweredByTitan = (
			<img src={ poweredByTitanLogo } alt={ translate( 'Powered by Titan' ) } />
		);

		const formFields = (
			<TitanNewMailboxList
				onMailboxesChange={ this.onTitanMailboxesChange }
				mailboxes={ this.state.titanMailboxes }
				domain={ domain.name }
				onReturnKeyPress={ this.onTitanFormReturnKeyPress }
				showLabels={ false }
			>
				<Button
					className="email-providers-stacked-comparison__titan-mailbox-action-continue"
					primary
					busy={ this.state.addingToCart }
					onClick={ this.onTitanConfirmNewMailboxes }
				>
					{ translate( 'Add Email' ) }
				</Button>
			</TitanNewMailboxList>
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
				expandButtonLabel={ translate( 'Add Email' ) }
				features={ getTitanFeatures() }
			/>
		);
	}

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
				className="email-providers-stacked-comparison__action-panel"
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

	render() {
		const { isGSuiteSupported } = this.props;

		return (
			<>
				{ this.renderHeaderSection() }
				{ this.renderTitanCard() }
				{ this.renderGoogleCard() }
				{ this.renderEmailForwardingCard() }
				<TrackComponentView
					eventName="calypso_email_providers_comparison_page_view"
					eventProperties={ {
						is_gsuite_supported: isGSuiteSupported,
						layout: 'stacked',
					} }
				/>
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
)( withShoppingCart( localize( EmailProvidersStackedComparison ) ) );
