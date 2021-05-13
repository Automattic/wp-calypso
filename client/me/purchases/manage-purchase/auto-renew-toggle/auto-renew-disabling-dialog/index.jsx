/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button, Dialog } from '@automattic/components';
import CancelAutoRenewalForm from 'calypso/components/marketing-survey/cancel-auto-renewal-form';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import {
	isDomainRegistration,
	isGSuiteOrGoogleWorkspace,
	isPlan,
	isTitanMail,
} from '@automattic/calypso-products';
import isSiteAtomic from 'calypso/state/selectors/is-site-automated-transfer';
import { getSite } from 'calypso/state/sites/selectors';
import './style.scss';

const DIALOG = {
	GENERAL: 'general',
	ATOMIC: 'atomic',
	SURVEY: 'survey',
};

class AutoRenewDisablingDialog extends Component {
	static propTypes = {
		isVisible: PropTypes.bool,
		translate: PropTypes.func.isRequired,
		planName: PropTypes.string.isRequired,
		siteDomain: PropTypes.string.isRequired,
		purchase: PropTypes.object.isRequired,
	};

	state = {
		dialogType: DIALOG.GENERAL,
		surveyHasShown: false,
	};

	getVariation() {
		const { purchase, isAtomicSite } = this.props;

		if ( isDomainRegistration( purchase ) ) {
			return 'domain';
		}

		if ( isPlan( purchase ) && isAtomicSite ) {
			return 'atomic';
		}

		if ( isPlan( purchase ) ) {
			return 'plan';
		}

		if ( isGSuiteOrGoogleWorkspace( purchase ) || isTitanMail( purchase ) ) {
			return 'email';
		}

		return null;
	}

	getCopy( variation ) {
		const { planName, siteDomain, purchase, translate, moment } = this.props;

		const expiryDate = moment( purchase.expiryDate ).format( 'LL' );

		switch ( variation ) {
			case 'plan':
				return translate(
					'By canceling auto-renewal, your %(planName)s plan for %(siteDomain)s will expire on %(expiryDate)s. ' +
						"When it does, you'll lose access to key features you may be using on your site. " +
						'To avoid that, turn auto-renewal back on or manually renew your plan before the expiration date.',
					{
						args: {
							planName,
							siteDomain,
							expiryDate,
						},
						comment:
							'%(planName)s is the name of a WordPress.com plan, e.g. Personal, Premium, Business. ' +
							'%(siteDomain)s is a domain name, e.g. example.com, example.wordpress.com. ' +
							'%(expiryDate)s is a date string, e.g. May 14, 2020',
					}
				);
			case 'domain':
				return translate(
					'By canceling auto-renewal, your domain %(domain)s will expire on %(expiryDate)s. ' +
						"Once your domain expires, there is no guarantee that you'll be able to get it back – " +
						'it could become unavailable and be impossible to purchase here, or at any other domain registrar. ' +
						'To avoid that, turn auto-renewal back on or manually renew your domain before the expiration date.',
					{
						args: {
							// in case of a domain registration, we need the actual domain bound to this purchase instead of the primary domain bound to the site.
							domain: purchase.meta,
							expiryDate,
						},
						comment:
							'%(domain)s is a domain name, e.g. example.com, example.wordpress.com. ' +
							'%(expiryDate)s is a date string, e.g. May 14, 2020',
					}
				);
			case 'atomic':
				return translate(
					'By canceling auto-renewal, your %(planName)s plan for %(siteDomain)s will expire on %(expiryDate)s. ' +
						'When it does, you will lose plugins, themes, design customizations, and possibly some content. ' +
						'To avoid that, turn auto-renewal back on or manually renew your plan before the expiration date.',
					{
						args: {
							planName,
							siteDomain,
							expiryDate,
						},
						comment:
							'%(planName)s is the name of a WordPress.com plan, e.g. Personal, Premium, Business. ' +
							'%(siteDomain)s is a domain name, e.g. example.com, example.wordpress.com. ' +
							'%(expiryDate)s is a date string, e.g. May 14, 2020',
					}
				);
			case 'email':
				return translate(
					'By canceling auto-renewal, your %(emailProductName)s subscription for %(domainName)s will expire on %(expiryDate)s. ' +
						'After it expires, you will not be able to send and receive emails for this domain. ' +
						'To avoid that, turn auto-renewal back on or manually renew your subscription before the expiration date.',
					{
						args: {
							domainName: purchase.meta,
							// Use the purchased product name to make sure it's correct
							emailProductName: purchase.productName,
							expiryDate,
						},
						comment:
							'%(emailProductName)s is the name of an email product, e.g. Email, Titan Mail, Google Workspace. ' +
							'%(domainName)s is a domain name, e.g. example.com. ' +
							'%(expiryDate)s is a date string, e.g. May 14, 2020',
					}
				);
			default:
				return translate(
					'By canceling auto-renewal, your %(productName)s subscription for %(siteDomain)s will expire on %(expiryDate)s. ' +
						"When it does, you'll lose access to key features you may be using on your site. " +
						'To avoid that, turn auto-renewal back on or manually renew your subscription before the expiration date.',
					{
						args: {
							productName: purchase.productName,
							siteDomain,
							expiryDate,
						},
						comment:
							'%(productName)s is the name of a WordPress.com product. ' +
							'%(siteDomain)s is a domain name, e.g. example.com, example.wordpress.com. ' +
							'%(expiryDate)s is a date string, e.g. May 14, 2020',
					}
				);
		}
	}

	onClickAtomicFollowUpConfirm = () => {
		this.props.onConfirm();
		this.setState( {
			dialogType: DIALOG.SURVEY,
		} );
	};

	closeAndCleanup = () => {
		this.props.onClose();

		// It is intentional that we don't reset `surveyHasShown` flag here.
		// That state is for preventing the survey from showing excessively.
		// The current behavior is that it won't show up until this component has been unmounted and then remounted.
		this.setState( {
			dialogType: DIALOG.GENERAL,
		} );
	};

	renderAtomicFollowUpDialog = () => {
		const { siteDomain, isVisible, translate } = this.props;

		const exportPath = '//' + siteDomain + '/wp-admin/export.php';

		return (
			<Dialog
				isVisible={ isVisible }
				additionalClassNames="auto-renew-disabling-dialog atomic-follow-up"
				onClose={ this.closeAndCleanup }
			>
				<p>
					{ translate(
						'Before you continue, we recommend downloading a backup of your site – ' +
							"that way, you'll have your content to use on any future websites you create."
					) }
				</p>
				<ul>
					<li>
						<Button href={ exportPath } primary>
							{ translate( 'Download a current backup' ) }
						</Button>
					</li>
					<li>
						<Button onClick={ this.onClickAtomicFollowUpConfirm }>
							{ translate(
								"I don't need a backup OR I already have a backup. Cancel my auto-renewal."
							) }
						</Button>
					</li>
				</ul>
			</Dialog>
		);
	};

	onClickGeneralConfirm = () => {
		if ( 'atomic' === this.getVariation() ) {
			this.setState( {
				dialogType: DIALOG.ATOMIC,
			} );
			return;
		}

		this.props.onConfirm();

		if ( this.state.surveyHasShown ) {
			return this.closeAndCleanup();
		}

		this.setState( {
			dialogType: DIALOG.SURVEY,
			surveyHasShown: true,
		} );
	};

	renderGeneralDialog = () => {
		const { isVisible, translate } = this.props;
		const description = this.getCopy( this.getVariation() );

		const buttons = [
			{
				action: 'close',
				label: translate( "I'll keep it" ),
				onClick: this.closeAndCleanup,
			},
			{
				action: 'confirm',
				label: translate( 'Confirm cancellation' ),
				onClick: this.onClickGeneralConfirm,
				isPrimary: true,
			},
		];

		return (
			<Dialog
				isVisible={ isVisible }
				additionalClassNames="auto-renew-disabling-dialog"
				onClose={ this.closeAndCleanup }
				buttons={ buttons }
			>
				<h2 className="auto-renew-disabling-dialog__header">{ translate( 'Before you go…' ) }</h2>
				<p>{ description }</p>
			</Dialog>
		);
	};

	renderSurvey = () => {
		const { purchase, isVisible, selectedSite } = this.props;

		return (
			<CancelAutoRenewalForm
				purchase={ purchase }
				selectedSite={ selectedSite }
				isVisible={ isVisible }
				onClose={ this.closeAndCleanup }
			/>
		);
	};

	render() {
		switch ( this.state.dialogType ) {
			case DIALOG.GENERAL:
				return this.renderGeneralDialog();
			case DIALOG.ATOMIC:
				return this.renderAtomicFollowUpDialog();
			case DIALOG.SURVEY:
				return this.renderSurvey();
		}
	}
}

export default connect( ( state, { purchase } ) => ( {
	isAtomicSite: isSiteAtomic( state, purchase.siteId ),
	selectedSite: getSite( state, purchase.siteId ),
} ) )( localize( withLocalizedMoment( AutoRenewDisablingDialog ) ) );
