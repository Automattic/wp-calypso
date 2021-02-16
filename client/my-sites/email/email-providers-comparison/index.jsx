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
import config from '@automattic/calypso-config';
import PromoCard from 'calypso/components/promo-section/promo-card';
import EmailProviderDetails from './email-provider-details';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
	GSUITE_BASIC_SLUG,
} from 'calypso/lib/gsuite/constants';
import { TITAN_MAIL_MONTHLY_SLUG } from 'calypso/lib/titan/constants';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import {
	emailManagementForwarding,
	emailManagementNewGSuiteAccount,
	emailManagementNewTitanAccount,
} from 'calypso/my-sites/email/paths';
import { errorNotice } from 'calypso/state/notices/actions';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import emailIllustration from 'calypso/assets/images/email-providers/email-illustration.svg';
import forwardingIcon from 'calypso/assets/images/email-providers/forwarding.svg';
import GSuiteProviderDetails from 'calypso/my-sites/email/email-providers-comparison/gsuite-provider-details';
import TitanProviderDetails from 'calypso/my-sites/email/email-providers-comparison/titan-provider-details';

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

		const { domain, currentRoute, selectedSiteSlug } = this.props;

		page( emailManagementNewTitanAccount( selectedSiteSlug, domain.name, currentRoute ) );
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
		const { currencyCode, titanMailProduct } = this.props;

		return (
			<TitanProviderDetails
				className={ className }
				currencyCode={ currencyCode }
				onAddTitanClick={ this.onAddTitanClick }
				titanMailProduct={ titanMailProduct }
			/>
		);
	}

	renderGSuiteDetails( className ) {
		const { currencyCode, gSuiteProduct } = this.props;

		return (
			<GSuiteProviderDetails
				className={ className }
				currencyCode={ currencyCode }
				gSuiteProduct={ gSuiteProduct }
				onAddGSuiteClick={ this.goToAddGSuite }
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
			selectedSiteSlug: getSelectedSiteSlug( state ),
		};
	},
	( dispatch ) => {
		return {
			errorNotice: ( text, options ) => dispatch( errorNotice( text, options ) ),
		};
	}
)( localize( EmailProvidersComparison ) );
