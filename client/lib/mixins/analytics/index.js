/** @format */

/**
 * Internal dependencies
 */

import analytics from 'lib/analytics';
import { getDomainTypeText } from 'lib/domains';
import { snakeCase } from 'lodash';

const EVENTS = {
	domainManagement: {
		edit: {
			navigationClick( action, domain ) {
				const domainType = getDomainTypeText( domain );

				analytics.ga.recordEvent(
					'Domain Management',
					`Clicked "${ action }" navigation link on a ${ domainType } in Edit`,
					'Domain Name',
					domain.name
				);

				analytics.tracks.recordEvent( 'calypso_domain_management_edit_navigation_click', {
					action: snakeCase( action ),
					section: snakeCase( domainType ),
				} );
			},

			noneClick( domain ) {
				analytics.ga.recordEvent(
					'Domain Management',
					'Clicked "None" privacy protection link on a Domain Registration in Edit',
					'Domain Name',
					domain.name
				);

				analytics.tracks.recordEvent( 'calypso_domain_management_edit_none_click' );
			},

			paymentSettingsClick( domain ) {
				const domainType = getDomainTypeText( domain );

				analytics.ga.recordEvent(
					'Domain Management',
					`Clicked "Payment Settings" Button on a ${ domainType } in Edit`,
					'Domain Name',
					domain.name
				);

				analytics.tracks.recordEvent( 'calypso_domain_management_edit_payment_settings_click', {
					section: snakeCase( domainType ),
				} );
			},
		},
	},
};

export default function( categoryName, subCategoryName ) {
	return {
		recordEvent( eventName, ...eventArguments ) {
			let category = EVENTS[ categoryName ];
			let categoryPath = categoryName;

			if ( ! category ) {
				throw new Error( `Unable to find '${ categoryPath }' category in analytics mixin` );
			}

			if ( subCategoryName ) {
				category = category[ subCategoryName ];
				categoryPath += `.${ subCategoryName }`;

				if ( ! category ) {
					throw new Error( `Unable to find '${ categoryPath }' category in analytics mixin` );
				}
			}

			if ( ! category[ eventName ] ) {
				throw new Error(
					`Unable to find '${ eventName }' event for '${ categoryPath }' category in analytics mixin`
				);
			}

			category[ eventName ].apply( null, eventArguments );
		},
	};
}
