/**
 * External Dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import support from 'lib/url/support';

export default [
	{
		value: 'misspelled',
		label: i18n.translate( 'I misspelled the domain' ),
		helpMessage: i18n.translate(
			'If you misspelled the domain name you were attempting to purchase, it’s likely that others will as well, ' +
			'and you might want to consider keeping the misspelled domain.'
		)
	},
	{
		value: 'other_host',
		label: i18n.translate( 'I want to use the domain with another service or host' ),
		helpMessage: i18n.translate(
			'Canceling a domain name causes the domain to become unavailable for a brief period. ' +
			'Afterward, anyone can repurchase. If you wish to use the domain with another service, ' +
			'you’ll want to {{a}}update your name servers{{/a}} instead.', {
				components: { a: <a href={ support.UPDATE_NAMESERVERS } target="_blank" /> }
			}
		)
	},
	{
		value: 'transfer',
		label: i18n.translate( 'I want to transfer my domain to another registrar' ),
		helpMessage: i18n.translate(
			'You may not transfer a domain name for 60 days after its purchase, renewal, name server change, ' +
			'or any contact information change. This is a rule set by the Internet Corporation for ' +
			'Assigned Names and Numbers (ICANN) and standard across all registrars. ' +
			'You will need to {{a}}update your name servers{{/a}} instead.', {
				components: { a: <a href={ support.UPDATE_NAMESERVERS } target="_blank" /> }
			}
		)
	},
	{
		value: 'expectations',
		label: i18n.translate( 'The service isn’t what I expected' ),
		helpMessage: i18n.translate(
			'If you misspelled the domain name you were attempting to purchase, it’s likely that others will as well, ' +
			'and you might want to consider keeping the misspelled domain.'
		)
	},
	{
		value: 'wanted_free',
		label: i18n.translate( 'I meant to get a free blog' ),
		helpMessage: i18n.translate( 'Please provide a brief description of your reasons for canceling:' ),
		showTextarea: true
	},
	{
		value: 'other',
		label: i18n.translate( 'Something not listed here' ),
		helpMessage: i18n.translate( 'Please provide a brief description of your reasons for canceling:' ),
		showTextarea: true
	}
];
