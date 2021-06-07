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
import { getTitanProductName } from 'calypso/lib/titan';

const TitanExistingForwardsNotice = ( { domainsWithForwards, selectedDomainName } ) => {
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
						productName: getTitanProductName(),
					},
					comment:
						'%(productName)s is the name of the product, e.g. Titan Mail or Email; %(domainName)s is a domain name, e.g. example.org',
				}
			) }
		</Notice>
	);
};

TitanExistingForwardsNotice.propTypes = {
	domainsWithForwards: PropTypes.arrayOf( PropTypes.string ).isRequired,
	selectedDomainName: PropTypes.string.isRequired,
};

export default TitanExistingForwardsNotice;
