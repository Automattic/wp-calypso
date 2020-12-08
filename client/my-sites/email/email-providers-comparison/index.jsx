/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import i18n, { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import page from 'page';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import PromoCard from 'calypso/components/promo-section/promo-card';
import EmailProviderDetails from './email-provider-details';
import {
	getCurrentUserCurrencyCode,
	getCurrentUserLocale,
} from 'calypso/state/current-user/selectors';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { GSUITE_BASIC_SLUG } from 'calypso/lib/gsuite/constants';
import { getAnnualPrice } from 'calypso/lib/gsuite';
import { hasDiscount } from 'calypso/components/gsuite/gsuite-price';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import {
	emailManagementForwarding,
	emailManagementNewGSuiteAccount,
} from 'calypso/my-sites/email/paths';
import wpcom from 'calypso/lib/wp';
import { errorNotice } from 'calypso/state/notices/actions';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import formatCurrency from '@automattic/format-currency';
import emailIllustration from 'calypso/assets/images/email-providers/email-illustration.svg';
import titanLogo from 'calypso/assets/images/email-providers/titan.svg';
import gSuiteLogo from 'calypso/assets/images/email-providers/gsuite.svg';
import forwardingIcon from 'calypso/assets/images/email-providers/forwarding.svg';

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
		isFetchingProvisioningURL: false,
	};

	goToEmailForwarding = () => {
		const { domain, currentRoute, selectedSiteSlug } = this.props;
		recordTracksEvent( 'calypso_email_providers_add_click', { provider: 'email-forwarding' } );
		page( emailManagementForwarding( selectedSiteSlug, domain.name, currentRoute ) );
	};

	goToAddGSuite = () => {
		const { domain, currentRoute, selectedSiteSlug } = this.props;
		recordTracksEvent( 'calypso_email_providers_add_click', { provider: 'gsuite' } );
		page( emailManagementNewGSuiteAccount( selectedSiteSlug, domain.name, 'basic', currentRoute ) );
	};

	onAddTitanClick = () => {
		if ( this.state.isFetchingProvisioningURL ) {
			return;
		}

		const { domain, translate } = this.props;
		this.setState( { isFetchingProvisioningURL: true } );
		this.fetchTitanOrderProvisioningURL( domain.name ).then( ( { error, provisioningURL } ) => {
			this.setState( { isFetchingProvisioningURL: false } );
			if ( error ) {
				this.props.errorNotice( translate( 'An unknown error occurred. Please try again later.' ) );
			} else {
				window.location.href = provisioningURL;
			}
		} );
		recordTracksEvent( 'calypso_email_providers_add_click', { provider: 'titan' } );
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
				features={ [
					translate( 'No billing' ),
					translate( 'Receive emails sent to your custom domain' ),
				] }
				buttonLabel={ buttonLabel }
				onButtonClick={ this.goToEmailForwarding }
				className={ className }
			/>
		);
	}

	renderTitanDetails( className ) {
		const { currentUserLocale, translate } = this.props;
		const isEnglish = includes( config( 'english_locales' ), currentUserLocale );
		const billingFrequency =
			isEnglish || i18n.hasTranslation( 'Annual or monthly billing' )
				? translate( 'Annual or monthly billing' )
				: translate( 'Monthly billing' );

		return (
			<EmailProviderDetails
				title={ translate( 'Titan Mail' ) }
				description={ translate(
					'Easy-to-use email with incredibly powerful features. Manage your email and more on any device.'
				) }
				image={ { path: titanLogo } }
				features={ [
					billingFrequency,
					translate( 'Send and receive from your custom domain' ),
					translate( '30GB storage' ),
					translate( 'Email, calendars, and contacts' ),
					translate( 'One-click import of existing emails and contacts' ),
					translate( 'Read receipts to track email opens' ),
				] }
				formattedPrice={ translate( '{{price/}} /user /month', {
					components: {
						price: <span>{ formatCurrency( 3.5, 'USD' ) }</span>,
					},
					comment: '{{price/}} is the formatted price, e.g. $20',
				} ) }
				buttonLabel={ translate( 'Add Titan Mail' ) }
				hasPrimaryButton={ true }
				isButtonBusy={ this.state.isFetchingProvisioningURL }
				onButtonClick={ this.onAddTitanClick }
				className={ className }
			/>
		);
	}

	renderGSuiteDetails() {
		const { currencyCode, gSuiteProduct, translate } = this.props;

		return (
			<EmailProviderDetails
				title={ translate( 'G Suite by Google' ) }
				description={ translate(
					"We've partnered with Google to offer you email, storage, docs, calendars, and more."
				) }
				image={ { path: gSuiteLogo } }
				features={ [
					translate( 'Annual billing' ),
					translate( 'Send and receive from your custom domain' ),
					translate( '30GB storage' ),
					translate( 'Email, calendars, and contacts' ),
					translate( 'Video calls, Docs, spreadsheets, and more' ),
				] }
				formattedPrice={ translate( '{{price/}} /user /year', {
					components: {
						price: <span>{ getAnnualPrice( gSuiteProduct?.cost ?? null, currencyCode ) }</span>,
					},
					comment: '{{price/}} is the formatted price, e.g. $20',
				} ) }
				discount={
					hasDiscount( gSuiteProduct )
						? translate( 'First year %(discountedPrice)s', {
								args: {
									discountedPrice: getAnnualPrice( gSuiteProduct.sale_cost, currencyCode ),
								},
								comment: '%(discountedPrice)s is a formatted price, e.g. $75',
						  } )
						: null
				}
				buttonLabel={ translate( 'Add G Suite' ) }
				onButtonClick={ this.goToAddGSuite }
			/>
		);
	}

	render() {
		const { isGSuiteSupported } = this.props;
		const cardClassName = isGSuiteSupported ? null : 'no-gsuite';
		return (
			<>
				{ this.renderHeaderSection() }
				<div className="email-providers-comparison__providers">
					{ this.renderForwardingDetails( cardClassName ) }
					{ this.renderTitanDetails( cardClassName ) }
					{ isGSuiteSupported && this.renderGSuiteDetails() }
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
		return {
			currencyCode: getCurrentUserCurrencyCode( state ),
			currentUserLocale: getCurrentUserLocale( state ),
			gSuiteProduct: getProductBySlug( state, GSUITE_BASIC_SLUG ),
			currentRoute: getCurrentRoute( state ),
			selectedSiteSlug: getSelectedSiteSlug( state ),
		};
	},
	( dispatch ) => {
		return {
			errorNotice: ( text, options ) => dispatch( errorNotice( text, options ) ),
		};
	}
)( localize( EmailProvidersComparison ) );
