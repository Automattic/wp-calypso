/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Dialog from 'components/dialog';
import './style.scss';

class AutoRenewDisablingDialog extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
		planName: PropTypes.string.isRequired,
		siteDomain: PropTypes.string.isRequired,
		expiryDate: PropTypes.string.isRequired,
	};

	render() {
		const { planName, siteDomain, expiryDate, translate, onClose } = this.props;

		const description = translate(
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

export default localize( AutoRenewDisablingDialog );
