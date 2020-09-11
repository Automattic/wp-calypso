/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

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
		domainName: PropTypes.string.isRequired,
	};

	renderHeaderSection() {
		const { domainName, translate } = this.props;
		const image = {
			path: emailIllustration,
			align: 'right',
		};

		const translateArgs = {
			args: {
				domainName: domainName,
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
						'Pick from one of our flexible options to connect your domain with email ' +
							'and start getting emails @%(domainName)s today.',
						translateArgs
					) }
				</p>
			</PromoCard>
		);
	}

	render() {
		const { currencyCode, gSuiteProduct, translate } = this.props;

		return (
			<>
				{ this.renderHeaderSection() }
				<div className="email-providers-comparison__providers">
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
						buttonLabel={ translate( 'Add email forwarding' ) }
					/>
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
					/>
					<EmailProviderDetails
						title={ translate( 'G Suite by Google' ) }
						description={ translate(
							"We've partnered with Google to offer you email, storage, docs, calendars, and more."
						) }
						image={ { path: gSuiteLogo } }
						features={ [
							translate( 'Monthly billing' ),
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
					/>
				</div>
			</>
		);
	}
}

export default connect( ( state ) => {
	return {
		currencyCode: getCurrentUserCurrencyCode( state ),
		gSuiteProduct: getProductBySlug( state, GSUITE_BASIC_SLUG ),
	};
} )( localize( EmailProvidersComparison ) );
