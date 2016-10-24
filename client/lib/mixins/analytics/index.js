/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { type as domainTypes } from 'lib/domains/constants';
import snakeCase from 'lodash/snakeCase';

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
	registerDomain: {
		addDomainButtonClick( domainName, section ) {
			analytics.ga.recordEvent(
				'Domain Search',
				'Clicked "Add" Button on a Domain Registration',
				'Domain Name',
				domainName
			);

			analytics.tracks.recordEvent( 'calypso_domain_search_add_button_click', {
				domain_name: domainName,
				section
			} );
		},

		removeDomainButtonClick( domainName ) {
			analytics.ga.recordEvent(
				'Domain Search',
				'Clicked "Remove" Button on a Domain Registration',
				'Domain Name',
				domainName
			);
		},

		mapDomainButtonClick( section ) {
			analytics.ga.recordEvent(
				'Domain Search',
				'Clicked "Map it" Button'
			);

			analytics.tracks.recordEvent( 'calypso_domain_search_results_mapping_button_click', { section } );
		},

		searchFormSubmit( searchBoxValue, section, timeDiffFromLastSearch, searchCount, searchVendor ) {
			analytics.ga.recordEvent(
				'Domain Search',
				'Submitted Search Form',
				'Search Box Value',
				searchBoxValue
			);

			analytics.tracks.recordEvent(
				'calypso_domain_search',
				{
					search_box_value: searchBoxValue,
					seconds_from_last_search: timeDiffFromLastSearch,
					search_count: searchCount,
					search_vendor: searchVendor,
					section
				}
			);
		},

		searchFormView( section ) {
			analytics.ga.recordEvent(
				'Domain Search',
				'Landed on Search'
			);

			analytics.tracks.recordEvent( 'calypso_domain_search_pageview', { section } );
		},

		searchResultsReceive( searchQuery, searchResults, responseTimeInMs, resultCount, section ) {
			analytics.ga.recordEvent(
				'Domain Search',
				'Receive Results',
				'Response Time',
				responseTimeInMs
			);

			analytics.tracks.recordEvent(
				'calypso_domain_search_results_suggestions_receive',
				{
					search_query: searchQuery,
					results: searchResults.join( ';' ),
					response_time_ms: responseTimeInMs,
					result_count: resultCount,
					section
				}
			);
		},

		domainAvailabilityReceive( searchQuery, availableStatus, responseTimeInMs, section ) {
			analytics.ga.recordEvent(
				'Domain Search',
				'Domain Availability Result',
				'Domain Available Status',
				availableStatus
			);

			analytics.tracks.recordEvent(
				'calypso_domain_search_results_availability_receive',
				{
					search_query: searchQuery,
					available_status: availableStatus,
					response_time: responseTimeInMs,
					section
				}
			);
		}
	},

	googleApps: {
		inputFocus( userIndex, fieldName, inputValue ) {
			analytics.ga.recordEvent(
				'Domain Search',
				`Focused On "${ fieldName }" Input for User #${ userIndex } in Google Apps Dialog`,
				'Input Value',
				inputValue
			);
		},

		addUserClick( section ) {
			analytics.ga.recordEvent(
				'Domain Search',
				'Clicked "Add User" Button in Google Apps Dialog'
			);

			analytics.tracks.recordEvent( 'calypso_google_apps_add_user_button_click', { section } );
		},

		addEmailButtonClick( section ) {
			analytics.ga.recordEvent(
				'Domain Search',
				'Clicked "Add Email" Button in Google Apps Dialog'
			);

			analytics.tracks.recordEvent( 'calypso_google_apps_add_email_button_click', { section } );
		},

		cancelButtonClick( section ) {
			analytics.ga.recordEvent(
				'Domain Search',
				'Clicked "Cancel" Button in Google Apps Dialog'
			);

			analytics.tracks.recordEvent( 'calypso_google_apps_cancel_button_click', { section } );
		},

		keepSearchingButtonClick() {
			analytics.ga.recordEvent(
				'Domain Search',
				'Click "Keep Searching" Button in Google Apps Dialog'
			);
		},

		formSubmit( section ) {
			analytics.ga.recordEvent(
				'Domain Search',
				'Submitted Form in Google Apps Dialog'
			);

			analytics.tracks.recordEvent( 'calypso_google_apps_form_submit', { section } );
		}
	},

	mapDomain: {
		formSubmit( searchBoxValue ) {
			analytics.ga.recordEvent(
				'Domain Search',
				'Submitted Form in Map Domain Step',
				'Search Box Value',
				searchBoxValue
			);
		},

		inputFocus( searchBoxValue ) {
			analytics.ga.recordEvent(
				'Domain Search',
				'Focused On Search Box Input in Map Domain Step',
				'Search Box Value',
				searchBoxValue
			);
		},

		goButtonClick( searchBoxValue, section ) {
			analytics.ga.recordEvent(
				'Domain Search',
				'Clicked "Go" Button in Map Domain Step',
				'Search Box Value',
				searchBoxValue
			);

			analytics.tracks.recordEvent( 'calypso_map_domain_step_go_click', {
				search_box_value: searchBoxValue,
				section
			} );
		},

		addDomainButtonClick( domainName, section ) {
			analytics.ga.recordEvent(
				'Domain Search',
				'Clicked "Add" Button on a Domain Registration in Map Domain Step',
				'Domain Name',
				domainName
			);

			analytics.tracks.recordEvent( 'calypso_map_domain_step_add_domain_click', {
				domain_name: domainName,
				section
			} );
		}
	},

	siteRedirect: {
		formSubmit( searchBoxValue ) {
			analytics.ga.recordEvent(
				'Domain Search',
				'Submitted Form in Site Redirect',
				'Search Box Value',
				searchBoxValue
			);
		},

		inputFocus( searchBoxValue ) {
			analytics.ga.recordEvent(
				'Domain Search',
				'Focused On Search Box Input in Site Redirect',
				'Search Box Value',
				searchBoxValue
			);
		},

		goButtonClick( searchBoxValue ) {
			analytics.ga.recordEvent(
				'Domain Search',
				'Clicked "Go" Button in Site Redirect',
				'Search Box Value',
				searchBoxValue
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
					`Clicked "Make Primary" link on a ${domainType} in Edit`,
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
					`Clicked "${action}" navigation link on a ${domainType} in Edit`,
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
					`Clicked "Payment Settings" Button on a ${domainType} in Edit`,
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
			},

			pendingAccountLogInClick( { siteSlug, domainName, user, severity, isMultipleDomains, section } ) {
				analytics.ga.recordEvent(
					'Domain Management',
					`Clicked "Log in" link in Google Apps pending ToS notice in ${ section }`,
					'Domain Name',
					domainName
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_google_apps_pending_account_log_in_click',
					{
						site_slug: siteSlug,
						domain_name: domainName,
						user,
						severity,
						is_multiple_domains: isMultipleDomains,
						section
					}
				);
			},

			showPendingAccountNotice( { siteSlug, severity, isMultipleDomains, section } ) {
				analytics.ga.recordEvent(
					'Domain Management',
					'Showed pending account notice',
					'Site',
					siteSlug
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_google_apps_pending_account_notice_show',
					{
						site_slug: siteSlug,
						severity,
						is_multiple_domains: isMultipleDomains,
						section
					}
				);
			}
		},

		list: {
			addDomainClick() {
				analytics.ga.recordEvent(
					'Domain Management',
					'Clicked "Add Domain" Button in List'
				);

				analytics.tracks.recordEvent( 'calypso_domain_management_list_add_domain_click' );
			},
			enablePrimaryDomainMode() {
				analytics.ga.recordEvent(
					'Domain Management',
					'Clicked "Change Primary" button in List'
				);

				analytics.tracks.recordEvent( 'calypso_domain_management_list_enable_primary_domain_mode_click' );
			},
			disablePrimaryDomainMode() {
				analytics.ga.recordEvent(
					'Domain Management',
					'Clicked "X" button to disable change primary mode in List'
				);

				analytics.tracks.recordEvent( 'calypso_domain_management_list_disable_primary_mode_click' );
			},
			changePrimary( domain ) {
				const section = snakeCase( getDomainTypeText( domain ) );
				analytics.ga.recordEvent(
					'Domain Management',
					'Changed Primary Domain to in List',
					'Domain Name',
					domain.name
				);

				analytics.tracks.recordEvent( 'calypso_domain_management_list_change_primary_domain_click', { section } );
			},
			undoChangePrimary( domain ) {
				const section = snakeCase( getDomainTypeText( domain ) );

				analytics.ga.recordEvent(
					'Domain Management',
					'Undo change Primary Domain in List',
					'Domain Name (Reverted to)',
					domain.name
				);

				analytics.tracks.recordEvent( 'calypso_domain_management_list_undo_change_primary_domain_click', { section } );
			}
		},

		primaryDomain: {
			cancelClick( domain ) {
				const domainType = getDomainTypeText( domain );

				analytics.ga.recordEvent(
					'Domain Management',
					`Clicked "Cancel" Button on a ${domainType} in Primary Domain`,
					'Domain Name',
					domain.name
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_primary_domain_cancel_click',
					{ section: snakeCase( domainType ) }
				);
			},

			updatePrimaryDomainClick( domain, success ) {
				const domainType = getDomainTypeText( domain );

				analytics.ga.recordEvent(
					'Domain Management',
					`Clicked "Update Primary Domain" Button on a ${domainType} in Primary Domain`,
					'Domain Name',
					domain.name
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_primary_domain_update_primary_domain_click',
					{
						section: snakeCase( domainType ),
						success
					}
				);
			}
		},

		siteRedirect: {
			cancelClick( domainName ) {
				analytics.ga.recordEvent(
					'Domain Management',
					'Clicked "Cancel" Button in Site Redirect',
					'Domain Name',
					domainName
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_site_redirect_cancel_click',
					{ domain_name: domainName }
				);
			},

			locationFocus( domainName ) {
				analytics.ga.recordEvent(
					'Domain Management',
					'Focused On "Location" Input in Site Redirect',
					'Domain Name',
					domainName
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_site_redirect_location_focus',
					{ domain_name: domainName }
				);
			},

			updateSiteRedirectClick( domainName, location, success ) {
				analytics.ga.recordEvent(
					'Domain Management',
					'Clicked "Update Site Redirect" Button in Site Redirect',
					'Domain Name',
					domainName
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_site_redirect_update_site_redirect_click',
					{
						domain_name: domainName,
						location,
						success
					}
				);
			}
		},

		nameServers: {
			wpcomNameServersToggleButtonClick( domainName, enabled ) {
				const state = enabled ? 'On' : 'Off';

				analytics.ga.recordEvent(
					'Domain Management',
					`Click Toggle Button in "Use WordPress.com Name Servers" Section to "${ state }" in Name Servers and DNS`,
					'Domain Name',
					domainName
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_name_servers_wpcom_name_servers_toggle_button_click',
					{
						domain_name: domainName,
						enabled
					}
				);
			},

			saveCustomNameServersClick( domainName ) {
				analytics.ga.recordEvent(
					'Domain Management',
					'Clicked "Save Custom Name Servers" in "Use Custom Name Servers" Form in Name Servers and DNS',
					'Domain Name',
					domainName
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_name_servers_save_custom_name_servers_click',
					{ domain_name: domainName }
				);
			},

			resetToDefaultsClick( domainName ) {
				analytics.ga.recordEvent(
					'Domain Management',
					'Clicked "Reset to Defaults" Button in "Use Custom Name Servers" Form in Name Servers and DNS',
					'Domain Name',
					domainName
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_name_servers_reset_to_defaults_click',
					{ domain_name: domainName }
				);
			},

			customNameserverInputFocus( domainName ) {
				analytics.ga.recordEvent(
					'Domain Management',
					'Focused Input in "Use Custom Name Servers" Form in Name Servers and DNS',
					'Domain Name',
					domainName
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_name_servers_custom_name_server_input_focus',
					{ domain_name: domainName }
				);
			},

			removeClick( domainName ) {
				analytics.ga.recordEvent(
					'Domain Management',
					'Clicked "Remove" in "Use Custom Name Servers" Form in Name Servers and DNS',
					'Domain Name',
					domainName
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_name_servers_remove_click',
					{ domain_name: domainName }
				);
			},

			wpcomNameServersLearnMoreClick( domainName ) {
				analytics.ga.recordEvent(
					'Domain Management',
					'Clicked "Learn More" link in "Use WordPress.com Name Servers" Section in Name Servers and DNS',
					'Domain Name',
					domainName
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_name_servers_wpcom_name_servers_learn_more_click',
					{ domain_name: domainName }
				);
			},

			customNameServersLearnMoreClick( domainName ) {
				analytics.ga.recordEvent(
					'Domain Management',
					'Clicked "Learn More" link in "Custom Name Servers" Form in Name Servers and DNS',
					'Domain Name',
					domainName
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_name_servers_custom_name_servers_learn_more_click',
					{ domain_name: domainName }
				);
			},

			customNameServersLookUpClick( domainName ) {
				analytics.ga.recordEvent(
					'Domain Management',
					'Clicked "Look up..." link in "Custom Name Servers" Form in Name Servers and DNS',
					'Domain Name',
					domainName
				);

				analytics.tracks.recordEvent(
					'calypso_domain_management_name_servers_wpcom_name_servers_look_up_click',
					{ domain_name: domainName }
				);
			}
		}
	}
};

module.exports = function( categoryName, subCategoryName ) {
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
};
