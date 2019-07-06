/** @format */
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
import Button from 'components/button';
import Dialog from 'components/dialog';
import CancelPurchaseForm from 'components/marketing-survey/cancel-purchase-form';
import { isDomainRegistration, isPlan } from 'lib/products-values';
import isSiteAtomic from 'state/selectors/is-site-automated-transfer';
import { getSite } from 'state/sites/selectors';
import './style.scss';

const DIALOG = {
	GENERAL: 'general',
	ATOMIC: 'atomic',
	SURVEY: 'survey',
};

class AutoRenewDisablingDialog extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
		planName: PropTypes.string.isRequired,
		siteDomain: PropTypes.string.isRequired,
		purchase: PropTypes.object.isRequired,
	};

	state = {
		showAtomicFollowUpDialog: false,
		dialogType: DIALOG.GENERAL,
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

		return null;
	}

	getCopy( variation ) {
		const { planName, siteDomain, purchase, translate } = this.props;

		const expiryDate = purchase.expiryMoment.format( 'LL' );

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
		}
	}

	onClickAtomicFollowUpConfirm = () => {
		this.props.onConfirm();
		this.setState( {
			dialogType: DIALOG.SURVEY,
		} );
	};

	renderAtomicFollowUpDialog = () => {
		const { siteDomain, onClose, translate } = this.props;

		const exportPath = '//' + siteDomain + '/wp-admin/export.php';

		return (
			<Dialog
				isVisible={ true }
				additionalClassNames="auto-renew-disabling-dialog atomic-follow-up"
				onClose={ onClose }
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
							{ translate( 'Download a backup' ) }
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
		this.setState( {
			dialogType: DIALOG.SURVEY,
		} );
	};

	renderGeneralDialog = () => {
		const { onClose, translate } = this.props;
		const description = this.getCopy( this.getVariation() );

		return (
			<Dialog
				isVisible={ true }
				additionalClassNames="auto-renew-disabling-dialog"
				onClose={ onClose }
			>
				<h2 className="auto-renew-disabling-dialog__header">{ translate( 'Before you go…' ) }</h2>
				<p>{ description }</p>
				<Button onClick={ this.onClickGeneralConfirm }>
					{ translate( 'Confirm cancellation' ) }
				</Button>
				<Button onClick={ onClose } primary>
					{ translate( "I'll keep it" ) }
				</Button>
			</Dialog>
		);
	};

	renderSurvey = () => {
		const { purchase, selectedSite, onClose } = this.props;

		return (
			<CancelPurchaseForm
				purchase={ purchase }
				selectedSite={ selectedSite }
				isVisible={ true }
				onClose={ onClose }
				onClickFinalConfirm={ onClose }
				flowType={ 'cancel_autorenew_survey_only' }
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
} ) )( localize( AutoRenewDisablingDialog ) );
