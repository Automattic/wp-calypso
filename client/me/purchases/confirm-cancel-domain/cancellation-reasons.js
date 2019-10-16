/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { TRANSFER_DOMAIN_REGISTRATION, UPDATE_NAMESERVERS } from 'lib/url/support';

export default [
	{
		value: 'misspelled',
		label: translate( 'I misspelled the domain' ),
		helpMessage: translate(
			'If you misspelled the domain name you were attempting to purchase, it’s likely that others will as well, ' +
				'and you might want to consider keeping the misspelled domain.'
		),
	},
	{
		value: 'other_host',
		label: translate( 'I want to use the domain with another service or host' ),
		helpMessage: translate(
			'Canceling a domain name causes the domain to become unavailable for a brief period. ' +
				'Afterward, anyone can repurchase. If you wish to use the domain with another service, ' +
				'you’ll want to {{a}}update your name servers{{/a}} instead.',
			{
				components: {
					a: <a href={ UPDATE_NAMESERVERS } target="_blank" rel="noopener noreferrer" />,
				},
			}
		),
	},
	{
		value: 'transfer',
		label: translate( 'I want to transfer my domain to another registrar' ),
		helpMessage: translate(
			'Canceling a domain name may cause the domain to become unavailable for a long time before it ' +
				'can be purchased again, and someone may purchase it before you get a chance. Instead, ' +
				'please {{a}}use our transfer out feature{{/a}} if you want to use this domain again in the future.',
			{
				components: {
					a: <a href={ TRANSFER_DOMAIN_REGISTRATION } target="_blank" rel="noopener noreferrer" />,
				},
			}
		),
	},
	{
		value: 'expectations',
		label: translate( 'The service isn’t what I expected' ),
		helpMessage: translate(
			'If you misspelled the domain name you were attempting to purchase, it’s likely that others will as well, ' +
				'and you might want to consider keeping the misspelled domain.'
		),
	},
	{
		value: 'wanted_free',
		label: translate( 'I meant to get a free blog' ),
		helpMessage: translate( 'Please provide a brief description of your reasons for canceling:' ),
		showTextarea: true,
	},
	{
		value: 'other',
		label: translate( 'Something not listed here' ),
		helpMessage: translate( 'Please provide a brief description of your reasons for canceling:' ),
		showTextarea: true,
	},
];
