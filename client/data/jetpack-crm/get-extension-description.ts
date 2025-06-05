/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Extension descriptions for CRM extensions
 * These are used to provide translatable descriptions for extensions
 * If a new extension is added the slug and description will need adding here
 */
export interface ExtensionDescription {
	slug: string;
	description: string;
}

/**
 * Get the translatable description for a CRM extension
 * @param slug - The extension slug
 * @returns The translated description or undefined if not found
 */
export function getExtensionDescription( slug: string ): string | undefined {
	const descriptions: Record< string, () => string > = {
		advancedsegments: () =>
			translate(
				'Personalise your communications by segmenting your contacts by total value, custom fields, and much more.'
			),
		apiconnector: () => translate( 'Add leads from different websites without writing code.' ),
		automations: () =>
			translate(
				'Save yourself time by automating actions when new contacts are added to your CRM.'
			),
		aweber: () =>
			translate(
				'Import and keep your CRM up to date with subscribers to your AWeber email list.'
			),
		awesomesupport: () =>
			translate( 'See what support tickets your CRM contacts have raised with you.' ),
		batchtag: () =>
			translate( 'Save time by tagging your customers in bulk based on their transactions.' ),
		clientportalpro: () =>
			translate(
				'Customise your Client Portal, Allow File Downloads, Display Tasks and Tickets plus much more'
			),
		contactform: () =>
			translate(
				'Use Contact Form 7 to collect leads and customer info. Save time by automating your lead generation process.'
			),
		csvpro: () =>
			translate(
				'Import your existing customer data into the Jetpack CRM system with our super simple CSV importer extension.'
			),
		exitbee: () =>
			translate(
				'Exit Bee Connect automatically adds your Exit Bee form completions into Jetpack CRM.'
			),
		funnels: () =>
			translate(
				'Visualise your contact acquisition stages from Lead through to Customer and see what stages contacts drop off.'
			),
		googlecontact: () =>
			translate(
				'Retrieve all customer data from Google Contacts. Keep all Leads in your CRM and start managing your contacts effectively.'
			),
		gravity: () =>
			translate(
				'Use Gravity Forms to collect leads and customer info. Save time by automating your lead generation process.'
			),
		groove: () =>
			translate(
				'Retrieve all customer data from Groove automatically. Keep all Leads in your CRM.'
			),
		invpro: () =>
			translate(
				'Invoicing PRO lets your customers pay their invoices right from your Client Portal using either PayPal or Stripe.'
			),
		convertkit: () =>
			translate(
				'Subscribe your contacts to your Kit.com email list automatically. Subscribe to a form, add a tag or subscribe to a sequence'
			),
		livestorm: () =>
			translate( 'Find out who signed up to your Livestorm webinars and who attended.' ),
		mailcamp: () =>
			translate( 'Send broadcasts and create email sequences to go to your CRM contact list.' ),
		mailchimp: () =>
			translate(
				'Subscribe your Jetpack CRM contacts to your MailChimp email marketing list automatically.'
			),
		membermouse: () =>
			translate(
				'Enhance your MemberMouse subscription website by integrating your data with Jetpack CRM'
			),
		optinmonster: () =>
			translate(
				'Connect your Optin Monster account to Jetpack CRM and see your leads in your CRM.'
			),
		paypal: () => translate( 'Retrieve customer data from PayPal automatically.' ),
		registrationmagic: () =>
			translate( 'Capture your form data from Registration Magic forms into your CRM.' ),
		salesdash: () =>
			translate(
				'The ultimate sales dashboard. Track Gross Revenue, Net Revenue, Customer growth right from your CRM.'
			),
		stripe: () => translate( 'Retrieve all customer data from Stripe automatically.' ),
		systememail: () =>
			translate( 'Set and schedule emails sent to your contacts and create canned replies.' ),
		twilio: () =>
			translate( 'Send text messages to your contacts and reach them when they are on the move.' ),
		wordpressutilities: () =>
			translate( 'Import your WordPress users to your CRM and see everyone in one place.' ),
		worldpay: () => translate( 'Retrieve all customer data from WorldPay automatically.' ),
	};

	return descriptions[ slug ]?.();
}
