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

class AutorenewalDisablingDialog extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
		planName: PropTypes.string.isRequired,
		siteDomain: PropTypes.string.isRequired,
		expiryDate: PropTypes.string.isRequired,
	};

	render() {
		const { planName, siteDomain, expiryDate, translate, onClose } = this.props;

		const description = translate(
			'By canceling autorenewal, your %(planName)s plan for %(siteDomain)s ' +
				'will expire on %(expiryDate)s unless you reenable autorenewal or manually renew your plan. ' +
				'If your plan expires, you will lose access to some awesome features.',
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
				additionalClassNames="autorenewal-disabling-dialog"
				onClose={ onClose }
			>
				<h2 className="autorenewal-disabling-dialog__header">{ translate( 'Before you go …' ) }</h2>
				<p>{ description }</p>
				<Button onClick={ onClose } primary>
					{ translate( 'OK' ) }
				</Button>
			</Dialog>
		);
	}
}

export default localize( AutorenewalDisablingDialog );
