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

const TitanExistingForwardsNotice = ( { domainsWithForwards } ) => {
	const translate = useTranslate();

	return domainsWithForwards.length ? (
		<Notice showDismiss={ false } status="is-warning">
			{ translate(
				'Please note that email forwards are not compatible with %(productName)s, ' +
					'and will be disabled once %(productName)s is added to this domain. The following ' +
					'domains have forwards:',
				{
					args: {
						productName: getTitanProductName(),
					},
					comment: '%(productName)s is the name of the product, e.g. Titan Mail or Email',
				}
			) }
			<ul>
				{ domainsWithForwards.map( ( domainName ) => {
					return <li key={ domainName }>{ domainName }</li>;
				} ) }
			</ul>
		</Notice>
	) : null;
};

TitanExistingForwardsNotice.propTypes = {
	domainsWithForwards: PropTypes.arrayOf( PropTypes.string ).isRequired,
};

export default TitanExistingForwardsNotice;
