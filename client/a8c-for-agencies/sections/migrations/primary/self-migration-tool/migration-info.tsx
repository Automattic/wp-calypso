import { external, download } from '@wordpress/icons';
import { CONTACT_URL_HASH_FRAGMENT_WITH_PRODUCT } from 'calypso/a8c-for-agencies/components/a4a-contact-support-widget';
import {
	A4A_MARKETPLACE_LINK,
	A4A_MIGRATIONS_COMMISSIONS_LINK,
	A4A_MIGRATIONS_PAYMENT_SETTINGS,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { TaskStepItem } from 'calypso/a8c-for-agencies/components/task-steps';

const pressableSteps = (
	translate: ( key: string, args?: Record< string, unknown > ) => string
): TaskStepItem[] => [
	{
		stepId: 'purchase-plan',
		count: 1,
		title: translate( 'Sign up for a Pressable plan in the Automattic for Agencies Marketplace' ),
		description: translate(
			'Begin by purchasing a Pressable plan in the Automattic for Agencies Marketplace.'
		),
		buttonProps: {
			variant: 'primary',
			label: translate( 'Go to Marketplace' ),
			href: A4A_MARKETPLACE_LINK,
			eventName: 'calypso_a4a_migrate_to_pressable_go_to_marketplace_click',
		},
	},
	{
		stepId: 'create-site',
		count: 2,
		title: translate( 'Create a "Migration placeholder" site in Pressable' ),
		description: translate(
			'In Pressable, click “Add site” and set “Migration placeholder” to yes.'
		),
		buttonProps: {
			variant: 'primary',
			label: translate( 'Launch Pressable Admin' ),
			icon: external,
			href: 'https://my.pressable.com',
			isExternal: true,
			eventName: 'calypso_a4a_migrate_to_pressable_launch_pressable_admin_click',
		},
	},
	{
		stepId: 'install-plugin',
		count: 3,
		title: translate( 'Install the Pressable Migration plugin' ),
		description: translate(
			'Login to the site that you will be moving to the Pressable platform (the source site) and navigate to Plugins > Add New. In the plugin search box, search for {{a}}“Pressable Automated Migration”{{/a}} (or upload the plugin if you downloaded it instead). When the plugin listing comes up, click on Install Now and then Activate',
			{
				components: {
					a: (
						<a
							href="https://wordpress.org/plugins/pressable-automated-migration/"
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
				},
			}
		),
		buttonProps: {
			variant: 'primary',
			label: translate( 'Download Migration plugin' ),
			icon: download,
			isExternal: true,
			href: 'https://wordpress.org/plugins/pressable-automated-migration/',
			eventName: 'calypso_a4a_migrate_to_pressable_download_migration_plugin_click',
		},
	},
	{
		stepId: 'migrate-site',
		count: 4,
		title: translate( 'Use the SFTP credentials provided in Pressable to migrate the site' ),
		description: translate(
			'Login to the {{a}}My.Pressable.com Dashboard{{/a}} and open up the settings page for the site you would like to migrate to. In the left menu, you will see a Site Actions tab. From that, navigate to the Migrate Site section. This section will show the details you will need for the Pressable Automated Migration plugin.',
			{
				components: {
					a: <a href="https://my.pressable.com" target="_blank" rel="noopener noreferrer" />,
				},
			}
		),
		buttonProps: {
			variant: 'primary',
			label: translate( 'Launch Pressable Admin' ),
			icon: external,
			isExternal: true,
			href: 'https://my.pressable.com',
			eventName: 'calypso_a4a_migrate_to_pressable_launch_pressable_admin_click',
		},
	},
	{
		stepId: 'install-agencies-plugin',
		count: 5,
		title: translate(
			'Ensure the Automattic for Agencies plugin is installed and activated on your Pressable site'
		),
		description: translate(
			"This lightweight plugin securely connects your clients' sites to the Automattic for Agencies Sites Dashboard."
		),
		buttonProps: {
			variant: 'primary',
			label: translate( 'Download the Agencies plugin' ),
			icon: download,
			isExternal: true,
			href: 'https://wordpress.org/plugins/automattic-for-agencies-client',
			eventName: 'calypso_a4a_migrate_to_pressable_download_agencies_plugin_click',
		},
	},
	{
		stepId: 'tag-site',
		count: 6,
		title: translate( 'Tag your site as “Migrated” so that we can review it for commissions' ),
		description: translate(
			"Once you've tagged your sites we'll review them and verify if they are eligible for commission. {{a}}Terms and conditions{{/a}}",
			{
				components: {
					a: (
						<a
							href="https://automattic.com/for-agencies/program-incentives/"
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
				},
			}
		),
		buttonProps: {
			variant: 'primary',
			label: translate( 'Tag your site' ),
			href: A4A_MIGRATIONS_COMMISSIONS_LINK,
			eventName: 'calypso_a4a_migrate_to_pressable_tag_site_click',
		},
	},
	{
		stepId: 'add-bank-info',
		count: 7,
		title: translate( 'Fill in your payment information to receive commissions' ),
		description: translate(
			'Add you bank and business information so that we can send you commission payments.'
		),
		buttonProps: {
			variant: 'primary',
			label: translate( 'Add my bank infomation' ),
			href: A4A_MIGRATIONS_PAYMENT_SETTINGS,
			eventName: 'calypso_a4a_migrate_to_pressable_add_bank_info_click',
		},
	},
];

const wpcomSteps = (
	translate: ( key: string, args?: Record< string, unknown > ) => string
): TaskStepItem[] => [
	{
		stepId: 'go-to-marketplace',
		count: 1,
		title: translate(
			'Purchase and create a new WordPress.com site in the Automattic for Agencies Marketplace'
		),
		description: translate(
			'Begin by purchasing a WordPress.com site in the Automattic for Agencies Marketplace.'
		),
		buttonProps: {
			variant: 'primary',
			label: translate( 'Go to Marketplace' ),
			href: A4A_MARKETPLACE_LINK,
			eventName: 'calypso_a4a_migrate_to_wpcom_go_to_marketplace_click',
		},
	},
	{
		stepId: 'go-to-import',
		count: 2,
		title: translate( 'Go to wordpress.com/import' ),
		description: translate(
			'Choose your site from the list, then enter the URL of your existing site.'
		),
		buttonProps: {
			variant: 'primary',
			label: translate( 'Launch WordPress.com' ),
			icon: external,
			isExternal: true,
			href: 'https://wordpress.com/import',
			eventName: 'calypso_a4a_migrate_to_wpcom_go_to_import_click',
		},
	},
	{
		stepId: 'install-plugin',
		count: 3,
		title: translate( 'Install the WordPress.com Migration plugin' ),
		description: translate(
			'Install and activate the {{a}}Migrate to WordPress.com plugin{{/a}} on your existing site. Then, go to the Migrate to WordPress.com page on your source site, enter your email address, and click Continue.',
			{
				components: {
					a: (
						<a
							href="https://wordpress.com/plugins/wpcom-migration"
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
				},
			}
		),
	},
	{
		stepId: 'start-migration',
		count: 4,
		title: translate( 'Start your migration' ),
		description: translate(
			'Copy and paste the migration key provided by WordPress.com into the Migration Key field and click Start migration. Wait until this process has finished before continuing.'
		),
	},
	{
		stepId: 'tag-site',
		count: 5,
		title: translate( 'Tag your site as “Migrated” so that we can review it for commissions' ),
		description: translate(
			"Once you've tagged your sites we'll review them and verify if they are eligible for commission. {{a}}Terms and conditions{{/a}}",
			{
				components: {
					a: (
						<a
							href="https://automattic.com/for-agencies/program-incentives/"
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
				},
			}
		),
		buttonProps: {
			variant: 'primary',
			label: translate( 'Tag your site' ),
			href: A4A_MIGRATIONS_COMMISSIONS_LINK,
			eventName: 'calypso_a4a_migrate_to_wpcom_tag_site_click',
		},
	},
	{
		stepId: 'add-bank-info',
		count: 6,
		title: translate( 'Fill in your payment information to receive commissions' ),
		description: translate(
			'Add you bank and business information so that we can send you commission payments.'
		),
		buttonProps: {
			variant: 'primary',
			label: translate( 'Add my bank infomation' ),
			href: A4A_MIGRATIONS_PAYMENT_SETTINGS,
			eventName: 'calypso_a4a_migration_to_wpcom_add_bank_info_click',
		},
	},
];

export const getMigrationInfo = (
	type: 'pressable' | 'wpcom',
	translate: ( key: string, args?: Record< string, unknown > ) => string
) => {
	const pageSubheading = translate(
		"Move your site and tag it for potential earnings by following these steps. If you need help finishing the transfer, don't hesitate to {{a}}contact us{{/a}}.",
		{
			components: {
				a: <a href={ CONTACT_URL_HASH_FRAGMENT_WITH_PRODUCT } rel="noopener noreferrer" />,
			},
		}
	);

	const steps = {
		pressable: {
			pageTitle: translate( 'Migrations: Migrate to Pressable' ),
			heading: translate( 'Migrate to Pressable' ),
			pageHeading: translate( 'Transfer your WordPress website to Pressable on your own.' ),
			pageSubheading,
			steps: pressableSteps( translate ),
			sessionStorageKey: 'a4a_migrate_to_pressable_steps',
		},
		wpcom: {
			pageTitle: translate( 'Migrations: Migrate to WordPress.com' ),
			heading: translate( 'Migrate to WordPress.com' ),
			pageHeading: translate( 'Transfer your WordPress website to WordPress.com on your own.' ),
			pageSubheading,
			steps: wpcomSteps( translate ),
			sessionStorageKey: 'a4a_migrate_to_wpcom_steps',
		},
	};
	return steps?.[ type ];
};
