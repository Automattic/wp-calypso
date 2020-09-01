/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PromoCard from '../../../components/promo-section/promo-card';
import EmailProviderDetails from './email-provider-details';
import emailIllustration from 'assets/images/titan/email-illustration.svg';
import forwardingIcon from 'assets/images/titan/forward.svg';
import emailIcon from 'assets/images/customer-home/gsuite.svg';

/**
 * Style dependencies
 */
import './style.scss';

class EmailProvidersComparison extends React.Component {
	renderHeaderSection() {
		const { translate } = this.props;
		const image = {
			path: emailIllustration,
			align: 'right',
		};
		return (
			<PromoCard
				isPrimary
				title={ translate( 'Get your own @example.com email address' ) }
				image={ image }
			>
				<p>
					{ translate(
						'Pick from one of our flexible options to connect your domain with email ' +
							'and start getting emails @example.com today.'
					) }
				</p>
			</PromoCard>
		);
	}

	render() {
		const { translate } = this.props;

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
					/>
					<EmailProviderDetails
						title={ translate( 'Titan Mail' ) }
						description={ translate(
							'Easy-to-use email with incredibly powerful features. Manage your email and more on any device.'
						) }
						image={ { path: emailIcon } }
						features={ [
							translate( 'Monthly billing' ),
							translate( 'Send and receive from your custom domain' ),
							translate( '10GB storage' ),
							translate( 'Email, calendars, and contacts' ),
						] }
					/>
					<EmailProviderDetails
						title={ translate( 'G Suite by Google' ) }
						description={ translate(
							"We've partnered with Google to offer you email, storage, docs, calendars, and more."
						) }
						image={ { path: emailIcon } }
						features={ [
							translate( 'Monthly billing' ),
							translate( 'Send and receive from your custom domain' ),
							translate( '30GB storage' ),
							translate( 'Email, calendars, and contacts' ),
							translate( 'Video calls, Docs, spreadsheets, and more' ),
						] }
					/>
				</div>
			</>
		);
	}
}

export default localize( EmailProvidersComparison );
