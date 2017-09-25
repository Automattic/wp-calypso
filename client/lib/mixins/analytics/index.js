/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { type as domainTypes } from 'lib/domains/constants';
import { snakeCase } from 'lodash';

const getDomainTypeText = function( domain ) {
	switch ( domain.type ) {
		case domainTypes.MAPPED:
			return 'Mapped Domain';

		case domainTypes.REGISTERED:
			return 'Registered Domain';

		case domainTypes.SITE_REDIRECT:
			return 'Site Redirect';

		case domainTypes.WPCOM:
			return 'Wpcom Domain';
	}
};

const EVENTS = {
	popupCart: {
		checkoutButtonClick() {
			analytics.ga.recordEvent(
				'Domain Search',
				'Click "Checkout" Button on Popup Cart'
			);
		},
		keepSearchButtonClick() {
			analytics.ga.recordEvent(
				'Domain Search',
				'Click "Keep Searching" Button on Popup Cart'
			);
		}
	},
	domainManagement: {
		addGoogleApps: {
			addAnotherEmailAddressClick( domainName ) {
				analytics.ga.recordEvent(
					'Domain Management',
					'Clicked "Add another email address" link in Add Google Apps',
					'Domain Name',
					domainName
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_add_google_apps_add_another_email_address_click',
					{ domain_name: domainName }
				);
			},

			cancelClick( domainName ) {
				analytics.ga.recordEvent(
					'Domain Management',
					'Clicked "Cancel" Button in Add Google Apps',
					'Domain Name',
					domainName
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_add_google_apps_cancel_click',
					{ domain_name: domainName }
				);
			},

			continueClick( domainName, success, numberOfLicenses ) {
				analytics.ga.recordEvent(
					'Domain Management',
					'Clicked "Continue" Button in Add Google Apps',
					'Domain Name',
					domainName
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_add_google_apps_continue_click',
					{
						domain_name: domainName,
						number_of_licenses: numberOfLicenses,
						success
					}
				);
			},

			domainChange( value, userIndex ) {
				analytics.ga.recordEvent(
					'Domain Management',
					`Changed "Domain" Input for User #${ userIndex } in Add Google Apps`,
					'Domain Name'
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_add_google_apps_domain_change',
					{
						user_index: userIndex,
						value
					}
				);
			},

			inputFocus( domainName, fieldName, userIndex ) {
				analytics.ga.recordEvent(
					'Domain Management',
					`Focused On "${ fieldName }" Input for User #${ userIndex } in Add Google Apps`,
					'Domain Name',
					domainName
				);

				analytics.tracks.recordEvent(
					`calypso_domain_management_add_google_apps_${ snakeCase( fieldName ) }_focus`,
					{
						domain_name: domainName,
						user_index: userIndex
					}
				);
			}
		},

		edit: {
			makePrimaryClick( domain ) {
				const domainType = getDomainTypeText( domain );

				analytics.ga.recordEvent(
					'Domain Management',
					`Clicked "Make Primary" link on a ${ domainType } in Edit`,
					'Domain Name',
					domain.name
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_edit_make_primary_click',
					{ section: snakeCase( domainType ) }
				);
			},

			navigationClick( action, domain ) {
				const domainType = getDomainTypeText( domain );

				analytics.ga.recordEvent(
					'Domain Management',
					`Clicked "${ action }" navigation link on a ${ domainType } in Edit`,
					'Domain Name',
					domain.name
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_edit_navigation_click',
					{
						action: snakeCase( action ),
						section: snakeCase( domainType )
					}
				);
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

				analytics.tracks.recordEvent(
					'calypso_domain_management_edit_payment_settings_click',
					{ section: snakeCase( domainType ) }
				);
			}
		},

		email: {
			andMoreClick( domainName ) {
				analytics.ga.recordEvent(
					'Domain Management',
					'Clicked "and More!" Google Apps link in Email',
					'Domain Name',
					domainName
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_email_and_more_click',
					{ domain_name: domainName }
				);
			},

			learnMoreClick( domainName ) {
				analytics.ga.recordEvent(
					'Domain Management',
					'Clicked "Learn more" Google Apps link in Email',
					'Domain Name',
					domainName
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_email_learn_more_click',
					{ domain_name: domainName }
				);
			}
		},

		emailForwarding: {
			addNewEmailForwardClick( domainName, mailbox, destination, success ) {
				analytics.ga.recordEvent(
					'Domain Management',
					'Clicked "Add New Email Forward" Button in Email Forwarding',
					'Domain Name',
					domainName
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_email_forwarding_add_new_email_forward_click',
					{
						destination,
						domain_name: domainName,
						mailbox,
						success
					}
				);
			},

			cancelClick( domainName ) {
				analytics.ga.recordEvent(
					'Domain Management',
					'Clicked "Cancel" Button in Email Forwarding',
					'Domain Name',
					domainName
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_email_forwarding_cancel_click',
					{ domain_name: domainName }
				);
			},

			deleteClick( domainName, mailbox, destination, success ) {
				analytics.ga.recordEvent(
					'Domain Management',
					'Clicked delete Button in Email Forwarding',
					'Domain Name',
					domainName
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_email_forwarding_delete_click',
					{
						destination,
						domain_name: domainName,
						mailbox,
						success
					}
				);
			},

			resendVerificationClick( domainName, mailbox, destination, success ) {
				analytics.ga.recordEvent(
					'Domain Management',
					'Clicked resend verification email Button in Email Forwarding',
					'Domain Name',
					domainName
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_email_forwarding_resend_verification_email_click',
					{
						destination,
						domain_name: domainName,
						mailbox,
						success
					}
				);
			},

			inputFocus( domainName, fieldName ) {
				analytics.ga.recordEvent(
					'Domain Management',
					`Focused On "${ fieldName }" Input in Email Forwarding`,
					'Domain Name',
					domainName
				);

				analytics.tracks.recordEvent(
					`calypso_domain_management_email_forwarding_${ snakeCase( fieldName ) }_focus`,
					{ domain_name: domainName }
				);
			},

			learnMoreClick( domainName ) {
				analytics.ga.recordEvent(
					'Domain Management',
					'Clicked "Learn more" link in Email Forwarding',
					'Domain Name',
					domainName
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_email_forwarding_learn_more_click',
					{ domain_name: domainName }
				);
			}
		},

		googleApps: {
			addGoogleAppsUserClick( domainName ) {
				analytics.ga.recordEvent(
					'Domain Management',
					'Clicked "Add Google Apps User" Button in Google Apps',
					'Domain Name',
					domainName
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_google_apps_add_google_apps_user_click',
					{ domain_name: domainName }
				);
			},

			manageClick( domainName, email ) {
				analytics.ga.recordEvent(
					'Domain Management',
					'Clicked "Manage" link in Google Apps',
					'User Email',
					email
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_google_apps_manage_click',
					{
						domain_name: domainName,
						email
					}
				);
			}
		},
	}
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
				throw new Error( `Unable to find '${ eventName }' event for '${ categoryPath }' category in analytics mixin` );
			}

			category[ eventName ].apply( null, eventArguments );
		}
	};
}
