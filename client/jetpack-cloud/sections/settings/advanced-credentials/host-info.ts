/**
 * External dependencies
 */
import { translate, TranslateResult } from 'i18n-calypso';

export interface LinkAndInfo {
	info?: TranslateResult;
	link?: string | TranslateResult;
}

enum InfoTypes {
	Text = 'Text',
	Link = 'Link',
	UnorderedList = 'UnorderedList',
	OrderedList = 'OrderedList',
	Line = 'Line',
}

export interface Text {
	type: InfoTypes.Text;
	text: string;
}

export interface Link {
	type: InfoTypes.Link;
	text: string;
	link: string;
}

export interface UnorderedList {
	type: InfoTypes.UnorderedList;
	items: string[];
}

export interface OrderedList {
	type: InfoTypes.OrderedList;
	items: string[];
}

export interface Line {
	type: InfoTypes.Line;
}

export type Info = Text | Link | UnorderedList | OrderedList | Line;

export const infoIsText = ( info: Info ): info is Text => info.type === InfoTypes.Text;
export const infoIsLink = ( info: Info ): info is Link => info.type === InfoTypes.Link;
export const infoIsUnorderedList = ( info: Info ): info is UnorderedList =>
	info.type === InfoTypes.UnorderedList;
export const infoIsOrderedList = ( info: Info ): info is OrderedList =>
	info.type === InfoTypes.OrderedList;
export const infoIsLine = ( info: Info ): info is Line => info.type === InfoTypes.Line;

export interface Host {
	id: string;
	name: string;
	allowGenericFill: boolean;
	credentialType?: Info[];
	serverAddress?: Info[];
	portNumber?: Info[];
	installationPath?: Info[];
	serverUserName?: Info[];
	serverPassword?: Info[];
	serverPrivateKey?: Info[];
}

export const topHosts: Host[] = [
	{
		id: 'amazon',
		name: 'Amazon / AWS',
		allowGenericFill: true,
		// sftp: {
		// 	link: 'https://docs.aws.amazon.com/transfer/latest/userguide/create-server-sftp.html',
		// },
		// ssh: {
		// 	link: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AccessingInstancesLinux.html',
		// },
	},
	{
		id: 'bluehost',
		name: 'Bluehost',
		allowGenericFill: false,
		// ftp: {
		// 	info: translate(
		// 		'FTP (File Transfer Protocol): the original standard for transferring files between servers.'
		// 	),
		// 	link: 'https://my.bluehost.com/cgi/help/ftpaccounts',
		// },
		credentialType: [
			{
				type: InfoTypes.UnorderedList,
				items: [
					translate(
						'FTP (File Transfer Protocol): the original standard for transferring files between servers.'
					).toString(),
					translate(
						'SFTP (Secure File Transfer Protocol): is like FTP, but adds a layer of security (SSH encryption).'
					).toString(),
					translate(
						'SFTP/SSH is the preferred method to choose. Both methods are supported by Bluehost.'
					).toString(),
				],
			},
			{
				type: InfoTypes.Line,
			},
			{
				type: InfoTypes.Link,
				text: translate( 'Read more' ).toString(),
				link: 'https://my.bluehost.com/cgi/help/ftpaccounts',
			},
		],
		serverAddress: [
			{
				type: InfoTypes.Text,
				text: translate(
					'Your Domain Name or server IP address. Both are available from the Bluehost cPanel.'
				).toString(),
			},
			{
				type: InfoTypes.Line,
			},
			{
				type: InfoTypes.Link,
				text: translate( 'Visit my Bluehost cPanel' ).toString(),
				link: 'https://my.bluehost.com/cgi-bin/cplogin',
			},
		],
		portNumber: [
			{
				type: InfoTypes.Text,
				text: translate( 'Enter port 21 for Bluehost’s FTP service.' ).toString(),
			},
		],
	},
	{
		id: 'dreamhost',
		name: 'Dreamhost',
		allowGenericFill: true,

		// ftp: 'https://help.dreamhost.com/hc/en-us/articles/115000675027',
		// sftp: 'https://help.dreamhost.com/hc/en-us/articles/115000675027',
		// ssh: 'https://help.dreamhost.com/hc/en-us/articles/216385837-Enabling-Shell-access',
	},
	{
		id: 'godaddy',
		name: 'GoDaddy',
		allowGenericFill: true,

		// 		ftp: false,
		// 		sftp: 'https://www.godaddy.com/help/upload-files-with-sftp-8940',
		// 		ssh: 'https://www.godaddy.com/help/enable-ssh-24596',
	},
	{
		id: 'hostgator',
		name: 'HostGator',
		allowGenericFill: true,

		// ftp: 'https://www.hostgator.com/help/article/ftp-settings-and-connection',
		// sftp: 'https://www.hostgator.com/help/article/secure-ftp-sftp-and-ftps',
		// ssh: 'https://www.hostgator.com/help/article/how-do-i-get-and-use-ssh-access',
	},
	{
		id: 'siteground',
		name: 'Siteground',
		allowGenericFill: true,

		// 		ftp: 'https://www.siteground.com/kb/establish-ftp-connection-hosting-account/',
		// 		sftp:
		// 			'https://www.siteground.com/kb/how_to_establish_sftp_connection_to_hosting_with_filezilla',
		// 		ssh: 'https://www.siteground.com/kb/cpanel/enable-ssh-shell-access-cpanel/',
	},
];

export const genericInfo: Host = {
	id: 'generic',
	name: 'Other',
	allowGenericFill: true,

	// ftp: {
	// 	info: translate(
	// 		'FTP (File Transfer Protocol): the original standard for transferring files between servers.'
	// 	),
	// 	link: translate( '{{a}}Read More{{/a}}', {
	// 		components: {
	// 			a: <a href="https://jetpack.com/support/ssh-sftp-and-ftp-credentials/" />,
	// 		},
	// 	} ),
	// },
	// sftp: {
	// 	info: translate(
	// 		'SFTP (Secure File Transfer Protocol): is like FTP, but adds a layer of security (SSH encryption).'
	// 	),
	// 	link: translate( '{{a}}Read More{{/a}}', {
	// 		components: {
	// 			a: <a href="https://jetpack.com/support/ssh-sftp-and-ftp-credentials/" />,
	// 		},
	// 	} ),
	// },
	// ssh: {
	// 	info: translate(
	// 		'SFTP/SSH is the preferred method to choose and should be supported by most modern hosts.'
	// 	),
	// 	link: translate( '{{a}}Read More{{/a}}', {
	// 		components: {
	// 			a: <a href="https://jetpack.com/support/ssh-sftp-and-ftp-credentials/" />,
	// 		},
	// 	} ),
	// },
};

export const otherHosts: Host[] = [
	genericInfo,
	{
		id: 'land1',
		name: '1&1',
		allowGenericFill: true,

		// 		ftp: false,
		// 		sftp:
		// 			'https://www.ionos.com/help/server-cloud-infrastructure/accordions-to-managed-cloud-hosting/sftp-ssh/activating-sftpssh-access/',
		// 		ssh:
		// 			'https://www.ionos.com/help/server-cloud-infrastructure/accordions-to-managed-cloud-hosting/sftp-ssh/activating-sftpssh-access/',
	},
	{
		id: 'digitalocean',
		name: 'DigitalOcean',
		allowGenericFill: true,

		// 		ftp: false,
		// 		sftp:
		// 			'https://www.digitalocean.com/community/tutorials/how-to-use-sftp-to-securely-transfer-files-with-a-remote-server#how-to-connect-with-sftp (SFTP)',
		// 		ssh: 'https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys--2 ',
	},

	{
		id: 'flywheel',
		name: 'Flywheel',
		allowGenericFill: true,

		// 		ftp: false,
		// 		sftp: 'https://getflywheel.com/wordpress-support/how-do-i-access-my-site-via-sftp/',
		// 		ssh: false,
	},
	{
		id: 'hostinger',
		name: 'Hostinger',
		allowGenericFill: true,

		// 		ftp: 'https://www.hostinger.com/how-to/i-m-having-trouble-connecting-to-ftp-what-should-i-do',
		// 		sftp: 'https://www.hostinger.com/how-to/do-you-provide-sftp-access',
		// 		ssh: 'https://www.hostinger.com/how-to/how-can-i-log-in-onto-my-account-via-ssh',
	},
	{
		id: 'hostmonster',
		name: 'HostMonster',
		allowGenericFill: true,

		// 		ftp: 'https://my.hostmonster.com/hosting/help/ftpaccounts',
		// 		sftp: 'https://my.hostmonster.com/hosting/help/ftpaccounts',
		// 		ssh: 'https://my.hostmonster.com/hosting/help/180',
	},
	{
		id: 'inmotion',
		name: 'InMotion Hosting',
		allowGenericFill: true,

		// 		ftp: 'https://www.inmotionhosting.com/support/website/ftp/getting-started-guide/',
		// 		sftp: 'https://www.inmotionhosting.com/support/website/ftp/shared-sftp-setup/',
		// 		ssh: 'https://www.inmotionhosting.com/support/website/ssh/shared-reseller-ssh',
	},
	{
		id: 'ipage',
		name: 'iPage',
		allowGenericFill: true,
		// 		ftp: 'https://www.ipage.com/help/article/ftp-how-to-connect-to-your-website',
		// 		sftp: 'https://www.ipage.com/help/article/ftp-how-to-connect-to-your-website',
		// 		ssh: false,
	},
	{
		id: 'justhost',
		name: 'Just Host',
		allowGenericFill: true,
		// 		ftp: 'https://my.justhost.com/hosting/help/ftpaccounts',
		// 		sftp: 'https://my.justhost.com/hosting/help/ftpaccounts',
		// 		ssh: 'https://my.justhost.com/hosting/help/180',
	},
	{
		id: 'kinsta',
		name: 'Kinsta',
		allowGenericFill: true,
		// 		ftp: false,
		// 		sftp: 'https://kinsta.com/knowledgebase/how-to-use-sftp/',
		// 		ssh: 'https://kinsta.com/knowledgebase/connect-to-ssh/',
	},
	{
		id: 'liquidweb',
		name: 'Liquid Web',
		allowGenericFill: true,
		// 		ftp: false,
		// 		sftp: 'https://www.liquidweb.com/kb/finding-sftpssh-credentials-managed-wordpress-portal/',
		// 		ssh: 'https://www.liquidweb.com/kb/finding-sftpssh-credentials-managed-wordpress-portal/',
	},
	{
		id: 'mediatemple',
		name: 'Media Temple',
		allowGenericFill: true,

		// 		ftp:
		// 			'https://mediatemple.net/community/products/dv/204643370/using-ftp-and-sftp#gs/What_you_need_gs',
		// 		sftp:
		// 			'https://mediatemple.net/community/products/dv/204643370/using-ftp-and-sftp#gs/What_you_need_gs',
		// 		ssh:
		// 			'https://mediatemple.net/community/products/dv/204403684/connecting-via-ssh-to-your-server',
	},
	{
		id: 'namecheap',
		name: 'Namecheap',
		allowGenericFill: true,
		// 		ftp:
		// 			'https://www.namecheap.com/support/knowledgebase/article.aspx/188/205/how-to-access-an-account-via-ftp',
		// 		sftp:
		// 			'https://www.namecheap.com/support/knowledgebase/article.aspx/188/205/how-to-access-an-account-via-ftp',
		// 		ssh:
		// 			'https://www.namecheap.com/support/knowledgebase/article.aspx/1016/89/how-to-access-a-hosting-account-via-ssh',
	},
	{
		id: 'ovh',
		name: 'OVH',
		allowGenericFill: true,

		// 		ftp: 'https://docs.ovh.com/gb/en/hosting/web_hosting_filezilla_user_guide/#ftp-connection',
		// 		sftp: 'https://docs.ovh.com/gb/en/hosting/web_hosting_filezilla_user_guide/#sftp-connection',
		// 		ssh:
		// 			'https://docs.ovh.com/gb/en/hosting/web_hosting_ssh_on_web_hosting_packages/#connecting-to-your-server-via-ssh',
	},
	{
		id: 'pagely',
		name: 'Pagely',
		allowGenericFill: true,
		// 		ftp: false,
		// 		sftp: 'https://support.pagely.com/hc/en-us/articles/203115864-Using-SFTP-With-Pagely',
		// 		ssh:
		// 			'https://support.pagely.com/hc/en-us/articles/227315588-Using-SSH-on-your-VPS-Enterprise-Server',
	},
	{
		id: 'pressable',
		name: 'Pressable',
		allowGenericFill: true,
		// 		ftp: false,
		// 		sftp: 'https://pressable.com/knowledgebase/ftp-access-through-pressable-sftp-tools/',
		// 		ssh: false,
	},
	{
		id: 'wpengine',
		name: 'WPEngine',
		allowGenericFill: true,
		// 		ftp: false,
		// 		sftp: 'https://wpengine.com/support/sftp/#Connect_to_SFTP',
		// 		ssh: 'https://wpengine.com/support/ssh-keys-for-shell-access/',
	},
];

export const getProviderNameFromId = ( searchId?: string ): string | null => {
	for ( const host of topHosts ) {
		if ( host.id === searchId ) {
			return host.name;
		}
	}
	for ( const host of otherHosts ) {
		if ( host.id === searchId ) {
			return host.name;
		}
	}
	return null;
};

export const getHostInfoFromId = ( searchId?: string ): Host | null => {
	for ( const host of topHosts ) {
		if ( host.id === searchId ) {
			return host;
		}
	}
	for ( const host of otherHosts ) {
		if ( host.id === searchId ) {
			return host;
		}
	}
	return null;
};
