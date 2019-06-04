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
						'Once your domain expires, it could become unavailable, and may be impossible to get back on any domain registrar.',
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

	render() {
		const { translate, onClose } = this.props;

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
					{ translate( 'OK' ) }
				</Button>
			</Dialog>
		);
	}
}

export default connect( ( state, { purchase } ) => ( {
	isAtomicSite: isSiteAtomic( state, purchase.siteId ),
} ) )( localize( AutoRenewDisablingDialog ) );
