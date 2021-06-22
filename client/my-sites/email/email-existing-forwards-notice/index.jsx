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

const EmailExistingForwardsNotice = ( { domainsWithForwards, selectedDomainName } ) => {
	const translate = useTranslate();

	if ( ! domainsWithForwards.includes( selectedDomainName ) ) {
		return null;
	}

	return (
		<Notice showDismiss={ false } status="is-warning">
			{ translate(
				'Please note that your existing email forwards for %(domainName)s will be removed if you upgrade to a hosted email solution. ' +
					'As part of the upgrade, you will need to specify the email addresses you want to keep using.',
				{
					args: {
						domainName: selectedDomainName,
					},
					comment: '%(domainName)s is a domain name, e.g. example.org',
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
