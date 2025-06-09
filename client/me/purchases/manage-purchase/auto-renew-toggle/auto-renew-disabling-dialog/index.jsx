import {
	isDomainRegistration,
	isGSuiteOrGoogleWorkspace,
	isPlan,
	isTitanMail,
} from '@automattic/calypso-products';
import { Button } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { ConfirmDialog, DialogContent, DialogFooter } from 'calypso/components/confirm-dialog';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import CancelAutoRenewalForm from 'calypso/components/marketing-survey/cancel-auto-renewal-form';
import { isAkismetTemporarySitePurchase } from 'calypso/me/purchases/utils';
import isSiteAtomic from 'calypso/state/selectors/is-site-automated-transfer';

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

		if ( isAkismetTemporarySitePurchase( purchase ) ) {
			return 'siteless';
		}

		return null;
	}

	getCopy( variation ) {
		const { planName, siteDomain, purchase, translate, moment } = this.props;
		const expiryDate = moment( purchase.expiryDate ).format( 'LL' );

		switch ( variation ) {
			case 'plan':
				return translate(
					'By canceling auto-renewal, your {{strong}}%(planName)s{{/strong}} plan for {{strong}}%(siteDomain)s{{/strong}} will expire on {{strong}}%(expiryDate)s{{/strong}}. ' +
						"When it does, you'll lose access to key features you may be using on your site. " +
						'To avoid that, turn auto-renewal back on or manually renew your plan before the expiration date.',
					{
						args: {
							planName,
							siteDomain,
							expiryDate,
						},
						components: {
							strong: <strong />,
						},
						comment:
							'%(planName)s is the name of a WordPress.com plan, e.g. Personal, Premium, Business. ' +
							'%(siteDomain)s is a domain name, e.g. example.com, example.wordpress.com. ' +
							'%(expiryDate)s is a date string, e.g. May 14, 2020',
					}
				);
			case 'domain':
				return translate(
					'By canceling auto-renewal, your domain {{strong}}%(domain)s{{/strong}} will expire on {{strong}}%(expiryDate)s{{/strong}}. ' +
						"Once your domain expires, there is no guarantee that you'll be able to get it back – " +
						'it could become unavailable and be impossible to purchase here, or at any other domain registrar. ' +
						'To avoid that, turn auto-renewal back on or manually renew your domain before the expiration date.',
					{
						args: {
							// in case of a domain registration, we need the actual domain bound to this purchase instead of the primary domain bound to the site.
							domain: purchase.meta,
							expiryDate,
						},
						components: {
							strong: <strong />,
						},
						comment:
							'%(domain)s is a domain name, e.g. example.com, example.wordpress.com. ' +
							'%(expiryDate)s is a date string, e.g. May 14, 2020',
					}
				);
			case 'atomic':
				return translate(
					'By canceling auto-renewal, your {{strong}}%(planName)s{{/strong}} plan for {{strong}}%(siteDomain)s{{/strong}} will expire on {{strong}}%(expiryDate)s{{/strong}}. ' +
						'When it expires, plugins, themes and design customizations will be deactivated. ' +
						'To avoid that, turn auto-renewal back on or manually renew your plan before the expiration date.',
					{
						args: {
							planName,
							siteDomain,
							expiryDate,
						},
						components: {
							strong: <strong />,
						},
						comment:
							'%(planName)s is the name of a WordPress.com plan, e.g. Personal, Premium, Business. ' +
							'%(siteDomain)s is a domain name, e.g. example.com, example.wordpress.com. ' +
							'%(expiryDate)s is a date string, e.g. May 14, 2020',
					}
				);
			case 'email':
				return translate(
					'By canceling auto-renewal, your {{strong}}%(emailProductName)s{{/strong}} subscription for {{strong}}%(domainName)s{{/strong}} will expire on {{strong}}%(expiryDate)s{{/strong}}. ' +
						'After it expires, you will not be able to send and receive emails for this domain. ' +
						'To avoid that, turn auto-renewal back on or manually renew your subscription before the expiration date.',
					{
						args: {
							domainName: purchase.meta,
							// Use the purchased product name to make sure it's correct
							emailProductName: purchase.productName,
							expiryDate,
						},
						components: {
							strong: <strong />,
						},
						comment:
							'%(emailProductName)s is the name of an email product, e.g. Email, Titan Mail, Google Workspace. ' +
							'%(domainName)s is a domain name, e.g. example.com. ' +
							'%(expiryDate)s is a date string, e.g. May 14, 2020',
					}
				);
			case 'siteless':
				return translate(
					'By canceling auto-renewal, your {{strong}}%(productName)s{{/strong}} subscription will expire on {{strong}}%(expiryDate)s{{/strong}}. ' +
						"When it does, you'll lose access to key features you may be using on your site. " +
						'To avoid that, turn auto-renewal back on or manually renew your subscription before the expiration date.',
					{
						args: {
							productName: purchase.productName,
							expiryDate,
						},
						components: {
							strong: <strong />,
						},
						comment:
							'%(productName)s is the name of an Akismet plan/ product. ' +
							'%(expiryDate)s is a date string, e.g. May 14, 2020',
					}
				);
			default:
				return translate(
					'By canceling auto-renewal, your {{strong}}%(productName)s{{/strong}} subscription for {{strong}}%(siteDomain)s{{/strong}} will expire on {{strong}}%(expiryDate)s{{/strong}}. ' +
						"When it does, you'll lose access to key features you may be using on your site. " +
						'To avoid that, turn auto-renewal back on or manually renew your subscription before the expiration date.',
					{
						args: {
							productName: purchase.productName,
							siteDomain,
							expiryDate,
						},
						components: {
							strong: <strong />,
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
		const { translate, isVisible, siteDomain } = this.props;
		const exportPath = '/backup/' + siteDomain;

		if ( ! isVisible ) {
			return null;
		}

		return (
			<ConfirmDialog
				onRequestClose={ this.closeAndCleanup }
				title={ translate( 'Download your content' ) }
			>
				<DialogContent>
					<p>
						{ translate(
							'Before you continue, we recommend downloading a backup of your site—that way, you’ll have your content to use on any future websites.'
						) }
					</p>
				</DialogContent>

				<DialogFooter>
					<Button onClick={ this.onClickAtomicFollowUpConfirm } variant="tertiary">
						{ translate( 'Turn off auto-renew' ) }
					</Button>
					<Button href={ exportPath } variant="primary">
						{ translate( 'Download content' ) }
					</Button>
				</DialogFooter>
			</ConfirmDialog>
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

		if ( ! isVisible ) {
			return null;
		}

		return (
			<ConfirmDialog
				onRequestClose={ this.closeAndCleanup }
				title={ translate( 'Turn off auto-renew' ) }
			>
				<DialogContent>
					<p>{ description }</p>
				</DialogContent>

				<DialogFooter>
					<Button onClick={ this.closeAndCleanup } variant="tertiary">
						{ translate( 'Keep auto-renew on' ) }
					</Button>
					<Button onClick={ this.onClickGeneralConfirm } variant="primary">
						{ translate( 'Turn off auto-renew' ) }
					</Button>
				</DialogFooter>
			</ConfirmDialog>
		);
	};

	renderSurvey = () => {
		const { purchase, isVisible } = this.props;

		return (
			<CancelAutoRenewalForm
				purchase={ purchase }
				selectedSiteId={ purchase.siteId }
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
} ) )( localize( withLocalizedMoment( AutoRenewDisablingDialog ) ) );
