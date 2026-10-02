import * as urls from '../src';
import { isThisASupportArticleLink } from '../src';

describe( 'isThisASupportArticleLink', () => {
	describe( 'valid support URLs', () => {
		test( 'matches standard root support URL', () => {
			expect( isThisASupportArticleLink( 'https://wordpress.com/support/' ) ).toBe( true );
		} );

		test( 'matches support article URLs', () => {
			expect(
				isThisASupportArticleLink( 'https://wordpress.com/support/domains/register-domain/' )
			).toBe( true );
			expect(
				isThisASupportArticleLink(
					'https://wordpress.com/support/add-email/adding-google-workspace-to-your-site/'
				)
			).toBe( true );
		} );

		test( 'matches localized support URLs with 2-letter language codes', () => {
			expect( isThisASupportArticleLink( 'https://wordpress.com/es/support/' ) ).toBe( true );
			expect( isThisASupportArticleLink( 'https://wordpress.com/fr/support/domains/' ) ).toBe(
				true
			);
			expect( isThisASupportArticleLink( 'https://wordpress.com/de/support/add-email/' ) ).toBe(
				true
			);
			expect(
				isThisASupportArticleLink( 'https://wordpress.com/ja/support/manage-purchases/' )
			).toBe( true );
		} );

		test( 'matches legacy support.wordpress.com subdomain URLs', () => {
			expect( isThisASupportArticleLink( 'https://support.wordpress.com/' ) ).toBe( true );
			expect( isThisASupportArticleLink( 'https://support.wordpress.com/domains/' ) ).toBe( true );
			expect( isThisASupportArticleLink( 'http://support.wordpress.com/my-account' ) ).toBe( true );
		} );

		test( 'matches support URLs with hash anchors and query parameters', () => {
			expect(
				isThisASupportArticleLink(
					'https://wordpress.com/support/domains/change-name-servers/#step-1-find-your-new-name-servers'
				)
			).toBe( true );
			expect(
				isThisASupportArticleLink( 'https://wordpress.com/support/?query=dns&rel=help' )
			).toBe( true );
			expect( isThisASupportArticleLink( 'https://wordpress.com/es/support/?s=dominio' ) ).toBe(
				true
			);
		} );
	} );

	describe( 'invalid non-support URLs', () => {
		test( 'rejects non-support wordpress.com URLs', () => {
			expect( isThisASupportArticleLink( 'https://wordpress.com' ) ).toBe( false );
			expect( isThisASupportArticleLink( 'https://wordpress.com/' ) ).toBe( false );
			expect( isThisASupportArticleLink( 'https://wordpress.com/plugins/' ) ).toBe( false );
			expect( isThisASupportArticleLink( 'https://wordpress.com/themes/' ) ).toBe( false );
			expect( isThisASupportArticleLink( 'https://wordpress.com/log-in' ) ).toBe( false );
			expect( isThisASupportArticleLink( 'https://wordpress.com/start' ) ).toBe( false );
		} );

		test( 'rejects other domains even if they include "support"', () => {
			expect( isThisASupportArticleLink( 'https://jetpack.com/support/' ) ).toBe( false );
			expect( isThisASupportArticleLink( 'https://google.com/support/' ) ).toBe( false );
			expect( isThisASupportArticleLink( 'https://example.com/support/domains/' ) ).toBe( false );
			expect( isThisASupportArticleLink( 'https://support.example.com/' ) ).toBe( false );
		} );

		test( 'rejects wordpress.org support URLs', () => {
			expect( isThisASupportArticleLink( 'https://wordpress.org/support/' ) ).toBe( false );
		} );

		test( 'rejects empty strings and malformed URLs', () => {
			expect( isThisASupportArticleLink( '' ) ).toBe( false );
			expect( isThisASupportArticleLink( 'not-a-valid-url' ) ).toBe( false );
			expect( isThisASupportArticleLink( '/support' ) ).toBe( false );
			expect( isThisASupportArticleLink( '/support/domains/' ) ).toBe( false );
		} );
	} );
} );

describe( 'exported URL constants', () => {
	test( 'defines SUPPORT_ROOT correctly', () => {
		expect( urls.SUPPORT_ROOT ).toBe( 'https://wordpress.com/support/' );
	} );

	test( 'defines Calypso internal help paths', () => {
		expect( urls.CALYPSO_HELP ).toBe( '/help' );
		expect( urls.CALYPSO_CONTACT ).toBe( '/help/contact' );
		expect( urls.CALYPSO_HELP_WITH_HELP_CENTER ).toBe( '/help?help-center=home' );
	} );

	test( 'defines Jetpack support and external service URLs', () => {
		expect( urls.JETPACK_SUPPORT ).toBe( 'https://jetpack.com/support/' );
		expect( urls.JETPACK_PRICING_PAGE ).toBe( 'https://jetpack.com/pricing/' );
		expect( urls.JETPACK_CONTACT_SUPPORT ).toBe(
			'https://jetpack.com/contact-support/?rel=support'
		);
		expect( urls.JETPACK_CONTACT_SUPPORT_NO_ASSISTANT ).toBe(
			'https://jetpack.com/contact-support/?rel=support&assistant=false'
		);
		expect( urls.JETPACK_SERVICE_VAULTPRESS ).toBe(
			'https://help.vaultpress.com/install-vaultpress/'
		);
		expect( urls.JETPACK_SERVICE_AKISMET ).toBe( 'https://akismet.com/support/' );
		expect( urls.GSUITE_LEARNING_CENTER ).toBe( 'https://workspace.google.com/learning-center/' );
	} );

	test( 'all wordpress.com support constants are recognized by isThisASupportArticleLink', () => {
		const supportUrls = [
			urls.ADDING_GSUITE_TO_YOUR_SITE,
			urls.ADDING_TITAN_TO_YOUR_SITE,
			urls.AUTO_RENEWAL,
			urls.CHANGE_NAME_SERVERS,
			urls.CHANGE_NAME_SERVERS_FINDING_OUT_NEW_NS,
			urls.CONCIERGE_SUPPORT,
			urls.CONTACT,
			urls.CUSTOM_DNS,
			urls.DOMAIN_REGISTRATION_AGREEMENTS,
			urls.DOMAIN_WAITING,
			urls.DOMAINS,
			urls.DOMAIN_CANCEL,
			urls.DOMAIN_EXPIRATION,
			urls.DOMAIN_EXPIRATION_AUCTION,
			urls.DOMAIN_EXPIRATION_REDEMPTION,
			urls.DOMAIN_RECENTLY_REGISTERED,
			urls.DOMAIN_PRICING_AND_AVAILABLE_TLDS,
			urls.DOMAIN_PROMOTIONAL_PRICING_POLICY,
			urls.DOMAIN_CHANGE_NAME_SERVERS,
			urls.DNS_RECORDS_ADD,
			urls.DNS_RECORDS_EDITING_OR_DELETING,
			urls.DNS_RECORDS_DEFAULT,
			urls.DNS_RECORDS_DEFAULT_MX,
			urls.DNS_RECORDS_DEFAULT_CNAME,
			urls.DNS_RECORDS_DEFAULT_A,
			urls.ECOMMERCE,
			urls.INCOMING_DOMAIN_TRANSFER_STATUSES,
			urls.INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS,
			urls.INCOMING_DOMAIN_TRANSFER,
			urls.INCOMING_DOMAIN_TRANSFER_PREPARE_UNLOCK,
			urls.INCOMING_DOMAIN_TRANSFER_PREPARE_AUTH_CODE,
			urls.INCOMING_DOMAIN_TRANSFER_AUTH_CODE_INVALID,
			urls.INCOMING_DOMAIN_TRANSFER_SUPPORTED_TLDS,
			urls.EDIT_PAYMENT_DETAILS,
			urls.EMAIL_FORWARDING,
			urls.EMAIL_VALIDATION_AND_VERIFICATION,
			urls.EMPTY_SITE,
			urls.FORMS,
			urls.GDPR_POLICIES,
			urls.HTTPS_SSL,
			urls.MAP_EXISTING_DOMAIN,
			urls.MAP_EXISTING_DOMAIN_UPDATE_DNS,
			urls.MAP_EXISTING_DOMAIN_UPDATE_A_RECORDS,
			urls.MAP_SUBDOMAIN,
			urls.MAP_SUBDOMAIN_WITH_CNAME_RECORDS,
			urls.MAP_DOMAIN_CHANGE_NAME_SERVERS,
			urls.PREMIUM_DOMAINS,
			urls.PRIVACY_PROTECTION,
			urls.PUBLIC_VS_PRIVATE,
			urls.REFUNDS,
			urls.REGISTER_DOMAIN,
			urls.SCHEDULED_UPDATES_SUPPORT,
			urls.SETTING_PRIMARY_DOMAIN,
			urls.SETTING_UP_PREMIUM_SERVICES,
			urls.SET_UP_EMAIL_AUTHENTICATION_FOR_YOUR_DOMAIN,
			urls.SITE_REDIRECT,
			urls.SUPPORT_ROOT,
			urls.TRANSFER_DOMAIN_REGISTRATION,
			urls.UPDATE_CONTACT_INFORMATION_EMAIL_OR_NAME_CHANGES,
			urls.UPDATE_NAMESERVERS,
			urls.WPCC,
		];

		supportUrls.forEach( ( url ) => {
			expect( isThisASupportArticleLink( url ) ).toBe( true );
		} );
	} );
} );
