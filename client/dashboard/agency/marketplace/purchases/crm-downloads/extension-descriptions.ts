import { __ } from '@wordpress/i18n';

// The download server sends English descriptions, so known extensions get a
// translatable copy. A new extension falls back to the server's text.
const DESCRIPTIONS: Record< string, () => string > = {
	advancedsegments: () =>
		__(
			'Personalise your communications by segmenting your contacts by total value, custom fields, and much more.'
		),
	apiconnector: () => __( 'Add leads from different websites without writing code.' ),
	automations: () =>
		__( 'Save yourself time by automating actions when new contacts are added to your CRM.' ),
	aweber: () =>
		__( 'Import and keep your CRM up to date with subscribers to your AWeber email list.' ),
	awesomesupport: () => __( 'See what support tickets your CRM contacts have raised with you.' ),
	batchtag: () => __( 'Save time by tagging your customers in bulk based on their transactions.' ),
	clientportalpro: () =>
		__(
			'Customise your Client Portal, Allow File Downloads, Display Tasks and Tickets plus much more'
		),
	contactform: () =>
		__(
			'Use Contact Form 7 to collect leads and customer info. Save time by automating your lead generation process.'
		),
	csvpro: () =>
		__(
			'Import your existing customer data into the Jetpack CRM system with our super simple CSV importer extension.'
		),
	exitbee: () =>
		__( 'Exit Bee Connect automatically adds your Exit Bee form completions into Jetpack CRM.' ),
	funnels: () =>
		__(
			'Visualise your contact acquisition stages from Lead through to Customer and see what stages contacts drop off.'
		),
	googlecontact: () =>
		__(
			'Retrieve all customer data from Google Contacts. Keep all Leads in your CRM and start managing your contacts effectively.'
		),
	gravity: () =>
		__(
			'Use Gravity Forms to collect leads and customer info. Save time by automating your lead generation process.'
		),
	groove: () =>
		__( 'Retrieve all customer data from Groove automatically. Keep all Leads in your CRM.' ),
	invpro: () =>
		__(
			'Invoicing PRO lets your customers pay their invoices right from your Client Portal using either PayPal or Stripe.'
		),
	convertkit: () =>
		__(
			'Subscribe your contacts to your Kit.com email list automatically. Subscribe to a form, add a tag or subscribe to a sequence'
		),
	livestorm: () => __( 'Find out who signed up to your Livestorm webinars and who attended.' ),
	mailcamp: () =>
		__( 'Send broadcasts and create email sequences to go to your CRM contact list.' ),
	mailchimp: () =>
		__(
			'Subscribe your Jetpack CRM contacts to your MailChimp email marketing list automatically.'
		),
	membermouse: () =>
		__( 'Enhance your MemberMouse subscription website by integrating your data with Jetpack CRM' ),
	optinmonster: () =>
		__( 'Connect your Optin Monster account to Jetpack CRM and see your leads in your CRM.' ),
	paypal: () => __( 'Retrieve customer data from PayPal automatically.' ),
	registrationmagic: () =>
		__( 'Capture your form data from Registration Magic forms into your CRM.' ),
	salesdash: () =>
		__(
			'The ultimate sales dashboard. Track Gross Revenue, Net Revenue, Customer growth right from your CRM.'
		),
	stripe: () => __( 'Retrieve all customer data from Stripe automatically.' ),
	systememail: () =>
		__( 'Set and schedule emails sent to your contacts and create canned replies.' ),
	twilio: () =>
		__( 'Send text messages to your contacts and reach them when they are on the move.' ),
	wordpressutilities: () =>
		__( 'Import your WordPress users to your CRM and see everyone in one place.' ),
	worldpay: () => __( 'Retrieve all customer data from WorldPay automatically.' ),
};

export function getExtensionDescription( slug: string, fallback: string ): string {
	return DESCRIPTIONS[ slug ]?.() ?? fallback;
}
