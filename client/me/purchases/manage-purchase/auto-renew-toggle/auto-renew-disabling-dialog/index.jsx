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
import { isDomainRegistration, isPlan } from 'lib/products-values';
import isSiteAtomic from 'state/selectors/is-site-automated-transfer';
import './style.scss';

class AutoRenewDisablingDialog extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
		planName: PropTypes.string.isRequired,
		siteDomain: PropTypes.string.isRequired,
		purchase: PropTypes.object.isRequired,
	};

	state = {
		showAtomicFollowUpDialog: false,
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
		this.props.onConfirm() || this.props.onClose();
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
						"In order to proceed, we recommend that you download a backup of your site's content to avoid losing content in the future."
					) }
				</p>
				<Button href={ exportPath } primary>
					{ translate( 'Backup my content' ) }
				</Button>
				<Button onClick={ this.onClickAtomicFollowUpConfirm }>
					{ translate( "I've already taken a backup, please cancel auto-renewal" ) }
				</Button>
				<Button onClick={ this.onClickAtomicFollowUpConfirm }>
					{ translate( "I'm not interested in taking a backup, please cancel auto-renewal" ) }
				</Button>
			</Dialog>
		);
	};

	onClickGeneralConfirm = () => {
		if ( 'atomic' === this.getVariation() ) {
			this.setState( {
				showAtomicFollowUpDialog: true,
			} );
			return;
		}

		this.props.onConfirm() || this.props.onClose();
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
				<Button onClick={ onClose } primary>
					{ translate( 'Confirm cancellation' ) }
				</Button>
			</Dialog>
		);
	};

	render() {
		return this.state.showAtomicFollowUpDialog
			? this.renderAtomicFollowUpDialog()
			: this.renderGeneralDialog();
	}
}

export default connect( ( state, { purchase } ) => ( {
	isAtomicSite: isSiteAtomic( state, purchase.siteId ),
} ) )( localize( AutoRenewDisablingDialog ) );
