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
				'Please note that email forwards are not compatible with our paid email service, ' +
					'and will be disabled if you add a paid email service to %(domainName)s.',
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
