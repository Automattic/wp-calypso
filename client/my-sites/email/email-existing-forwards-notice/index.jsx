/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'calypso/components/notice';

const EmailExistingForwardsNotice = ( {
	domainsWithForwards,
	productName,
	selectedDomainName,
} ) => {
	const translate = useTranslate();

	if ( ! domainsWithForwards.includes( selectedDomainName ) ) {
		return null;
	}

	return (
		<Notice showDismiss={ false } status="is-warning">
			{ translate(
				'Please note that email forwards are not compatible with %(productName)s, ' +
					'and will be disabled once %(productName)s is added to %(domainName)s.',
				{
					args: {
						domainName: selectedDomainName,
						productName,
					},
					comment:
						'%(productName)s is the name of the product, e.g. Professional Email, Google Workspace; %(domainName)s is a domain name, e.g. example.org',
				}
			) }
		</Notice>
	);
};

EmailExistingForwardsNotice.propTypes = {
	domainsWithForwards: PropTypes.arrayOf( PropTypes.string ).isRequired,
	selectedDomainName: PropTypes.string.isRequired,
};

export default EmailExistingForwardsNotice;
