/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import page from 'page';

/**
 * Internal dependencies
 */
import PromoCard from 'components/promo-section/promo-card';
import EmailProviderDetails from './email-provider-details';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getProductBySlug } from 'state/products-list/selectors';
import { GSUITE_BASIC_SLUG } from 'lib/gsuite/constants';
import { getAnnualPrice } from 'lib/gsuite';
import { hasDiscount } from 'components/gsuite/gsuite-price';
import getCurrentRoute from 'state/selectors/get-current-route';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import { emailManagementForwarding, emailManagementNewGSuiteAccount } from 'my-sites/email/paths';
import emailIllustration from 'assets/images/email-providers/email-illustration.svg';
import titanLogo from 'assets/images/email-providers/titan.svg';
import gSuiteLogo from 'assets/images/email-providers/gsuite.svg';
import forwardingIcon from 'assets/images/email-providers/forwarding.svg';

/**
 * Style dependencies
 */
import './style.scss';

class EmailProvidersComparison extends React.Component {
	static propTypes = {
		domain: PropTypes.object.isRequired,
		isGSuiteSupported: PropTypes.bool.isRequired,
	};

	goToEmailForwarding = () => {
		const { domain, currentRoute, selectedSiteSlug } = this.props;
		page( emailManagementForwarding( selectedSiteSlug, domain.name, currentRoute ) );
	};

	goToAddGSuite = () => {
		const { domain, currentRoute, selectedSiteSlug } = this.props;
		page( emailManagementNewGSuiteAccount( selectedSiteSlug, domain.name, 'basic', currentRoute ) );
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
		const { translate } = this.props;

		return (
			<EmailProviderDetails
				title={ translate( 'Titan Mail' ) }
				badge={ translate( 'Recommended' ) }
				description={ translate(
					'Easy-to-use email with incredibly powerful features. Manage your email and more on any device.'
				) }
				image={ { path: titanLogo } }
				features={ [
					translate( 'Monthly billing' ),
					translate( 'Send and receive from your custom domain' ),
					translate( '10GB storage' ),
					translate( 'Email, calendars, and contacts' ),
				] }
				formattedPrice={ translate( '{{price/}} /user /month', {
					components: {
						price: <span>$4</span>,
					},
					comment: '{{price/}} is the formatted price, e.g. $20',
				} ) }
				buttonLabel={ translate( 'Add Titan Mail' ) }
				hasPrimaryButton={ true }
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
				</div>
			</>
		);
	}
}

export default connect( ( state ) => {
	return {
		currencyCode: getCurrentUserCurrencyCode( state ),
		gSuiteProduct: getProductBySlug( state, GSUITE_BASIC_SLUG ),
		currentRoute: getCurrentRoute( state ),
		selectedSiteSlug: getSelectedSiteSlug( state ),
	};
} )( localize( EmailProvidersComparison ) );
