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
			}
		);

		return (
			<Dialog
				isVisible={ true }
				additionalClassNames="autorenewal-disabling-dialog"
				onClose={ onClose }
			>
				<p>{ description }</p>
				<Button onClick={ onClose } primary>
					{ translate( 'OK' ) }
				</Button>
			</Dialog>
		);
	}
}

export default localize( AutorenewalDisablingDialog );
