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
import PromoCard from '../../../components/promo-section/promo-card';
import EmailProviderDetails from './email-provider-details';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getProductBySlug } from 'state/products-list/selectors';
import { GSUITE_BASIC_SLUG } from 'lib/gsuite/constants';
import { getAnnualPrice } from 'lib/gsuite';
import { hasDiscount } from '../../../components/gsuite/gsuite-price';
import emailIllustration from 'assets/images/titan/email-illustration.svg';

/**
 * Style dependencies
 */
import './style.scss';

class EmailProvidersComparison extends React.Component {
	static propTypes = {
		domain: PropTypes.string.isRequired,
	};

	renderHeaderSection() {
		const { domain, translate } = this.props;
		const image = {
			path: emailIllustration,
			align: 'right',
		};

		const translateArgs = {
			args: {
				domainName: domain,
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

	renderEmailForwardingLogo() {
		return (
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g clip-path="url(#clip0)">
					<rect width="24" height="24" fill="white" />
					<mask
						id="mask0"
						mask-type="alpha"
						maskUnits="userSpaceOnUse"
						x="1"
						y="1"
						width="22"
						height="22"
					>
						<path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M11.9999 6.66658V1.33325L22.6666 11.9999L11.9999 22.6666V17.3333H1.33325V6.66658H11.9999ZM18.8933 11.9999L14.6666 7.77325V9.33325H3.99992V14.6666H14.6666V16.2266L18.8933 11.9999Z"
							fill="white"
						/>
					</mask>
					<g mask="url(#mask0)">
						<rect x="-4" y="-4" width="32" height="32" fill="#7BB1CD" />
					</g>
				</g>
				<defs>
					<clipPath id="clip0">
						<rect width="24" height="24" fill="white" />
					</clipPath>
				</defs>
			</svg>
		);
	}

	renderTitanLogo() {
		return (
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g clip-path="url(#clip0)">
					<rect width="24" height="24" fill="white" />
					<path
						d="M19.4907 19.5808L12.2968 23.1776C12.2604 23.1963 12.2222 23.2117 12.1828 23.2234C12.1219 23.2416 12.0604 23.2501 12 23.2501C11.9396 23.2501 11.8781 23.2416 11.8172 23.2234C11.7778 23.2117 11.7396 23.1963 11.7032 23.1776L4.50931 19.5808C4.2891 19.4707 4.15 19.2456 4.15 18.9994V10.9769L0.27751 8.76413C0.0837898 8.65343 -0.0389843 8.45158 -0.0493088 8.2301L-0.0493355 8.22893L-0.0499992 8.20095V8.19979V2.73V2.68V2.58231V2.2V2.15H-0.0482883C-0.0178967 1.54046 0.437481 0.95 1.20144 0.95H22.7986V0.949995L22.7992 0.950005L22.8378 0.950533V0.950528L22.8385 0.950547C23.5773 0.970846 24.0186 1.54967 24.0485 2.15H24.05V2.19951C24.0501 2.20987 24.0501 2.22024 24.05 2.2306V2.58231V2.68V2.73V8.19979H24.05L24.05 8.20095L24.0493 8.22893L24.0493 8.22893L24.0493 8.2301C24.039 8.45158 23.9162 8.65343 23.7225 8.76413L19.85 10.977V18.9994C19.85 19.2456 19.7109 19.4707 19.4907 19.5808ZM22.75 7.82274V3.58948L18.7815 5.3535L12.65 8.08773V21.5482L18.55 18.5982L18.55 10.6L18.55 10.5988L18.5507 10.5709L18.5507 10.5697C18.561 10.3482 18.6838 10.1463 18.8775 10.0356L22.75 7.82274ZM5.8232 4.19961L12 6.94528L18.2114 4.18429L22.5492 2.25H1.45098L5.82315 4.19959L5.8232 4.19961ZM11.35 21.5475V8.08752L5.28321 5.38225L5.28316 5.38223L1.25 3.58938V7.82254L5.12249 10.0354C5.31621 10.1461 5.43899 10.3479 5.44931 10.5694L5.44934 10.5706L5.45 10.5985V10.5997V18.5976L11.35 21.5475Z"
						fill="#101517"
						stroke="#101517"
						stroke-width="0.1"
					/>
				</g>
				<defs>
					<clipPath id="clip0">
						<rect width="24" height="24" fill="white" />
					</clipPath>
				</defs>
			</svg>
		);
	}

	renderGsuiteLogo() {
		return (
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<rect width="24" height="24" fill="white" />
				<g clip-path="url(#clip0)">
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M16.5259 6.28807C15.3672 5.15326 13.8208 4.53504 12.2208 4.56045C9.29292 4.56045 6.80633 6.58871 5.91973 9.31987L5.91945 9.31965V9.31985C5.44935 10.7511 5.44935 12.3008 5.91945 13.7321L5.91929 13.7322H5.92385C6.81458 16.4591 9.29705 18.4874 12.2249 18.4874C13.7361 18.4874 15.0335 18.0905 16.039 17.3895V17.3862C17.2225 16.5817 18.0308 15.3156 18.2823 13.8844H12.2205V9.44678H22.806C22.938 10.2174 22.9999 11.005 22.9999 11.7884C22.9999 15.2934 21.78 18.2567 19.6574 20.2638L19.6599 20.2658C17.8001 22.0273 15.2476 23.0478 12.2208 23.0478C7.97746 23.0478 4.09705 20.5918 2.19189 16.7005V16.7001L2.19162 16.7003C0.599865 13.4441 0.599865 9.60779 2.19162 6.35156H2.19191C4.09706 2.45596 7.97747 4.41542e-05 12.2208 4.41542e-05C15.0084 -0.0338307 17.7012 1.0417 19.73 2.99797L16.5259 6.28807Z"
						fill="#5F6369"
					/>
				</g>
				<defs>
					<clipPath id="clip0">
						<rect width="22" height="23.0476" fill="white" transform="translate(1)" />
					</clipPath>
				</defs>
			</svg>
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
						image={ this.renderEmailForwardingLogo() }
						features={ [
							translate( 'No billing' ),
							translate( 'Receive emails sent to your custom domain' ),
						] }
						cta={ translate( 'Add email forwarding' ) }
					/>
					<EmailProviderDetails
						title={ translate( 'Titan Mail' ) }
						badge={ translate( 'Recommended' ) }
						description={ translate(
							'Easy-to-use email with incredibly powerful features. Manage your email and more on any device.'
						) }
						image={ this.renderTitanLogo() }
						features={ [
							translate( 'Monthly billing' ),
							translate( 'Send and receive from your custom domain' ),
							translate( '10GB storage' ),
							translate( 'Email, calendars, and contacts' ),
						] }
						formattedPrice={ '$4' }
						billingInterval={ translate( '/user /month' ) }
						cta={ translate( 'Add Titan Mail' ) }
						primaryCTA={ true }
					/>
					<EmailProviderDetails
						title={ translate( 'G Suite by Google' ) }
						description={ translate(
							"We've partnered with Google to offer you email, storage, docs, calendars, and more."
						) }
						image={ this.renderGsuiteLogo() }
						features={ [
							translate( 'Monthly billing' ),
							translate( 'Send and receive from your custom domain' ),
							translate( '30GB storage' ),
							translate( 'Email, calendars, and contacts' ),
							translate( 'Video calls, Docs, spreadsheets, and more' ),
						] }
						formattedPrice={ getAnnualPrice( gSuiteProduct?.cost ?? null, currencyCode ) }
						billingInterval={ translate( '/user /year' ) }
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
						cta={ translate( 'Add G Suite' ) }
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
