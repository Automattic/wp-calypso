import { translate } from 'i18n-calypso';

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

export type InfoSplit = {
	ftp: Info[];
	sftp: Info[];
};

export const infoIsSplit = ( info: InfoSplit | Info[] ): info is InfoSplit =>
	!! ( info as InfoSplit ).ftp && !! ( info as InfoSplit ).sftp;

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
	supportLink?: string;
	credentialLinks?: {
		ftp?: string;
		sftp?: string;
	};
	defaultPort?: {
		ftp?: number;
		sftp?: number;
	};
	inline?: {
		protocol?: InfoSplit | Info[];
		host?: InfoSplit | Info[];
		port?: InfoSplit | Info[];
		path?: InfoSplit | Info[];
		user?: InfoSplit | Info[];
		pass?: InfoSplit | Info[];
		kpri?: InfoSplit | Info[];
		mode?: InfoSplit | Info[];
	};
}

export const topHosts: Host[] = [
	{
		id: 'amazon',
		name: 'Amazon / AWS',
		// supportLink: '',
		credentialLinks: {
			sftp: 'https://docs.aws.amazon.com/transfer/latest/userguide/create-server-sftp.html ',
		},
	},
	{
		id: 'bluehost',
		name: 'Bluehost',
		inline: {
			protocol: {
				ftp: [
					{
						type: InfoTypes.UnorderedList,
						items: [
							translate(
								'FTP (File Transfer Protocol): the original standard for transferring files between servers.'
							),
							translate(
								'SFTP (Secure File Transfer Protocol): is like FTP, but adds a layer of security (SSH encryption).'
							),
							translate(
								'SFTP/SSH is the preferred method to choose. Both methods are supported by Bluehost.'
							),
						],
					},

					{
						type: InfoTypes.Line,
					},
					{
						type: InfoTypes.Link,
						text: translate( 'Read more' ),
						link: 'https://my.bluehost.com/cgi/help/ftpaccounts',
					},
				],
				sftp: [
					{
						type: InfoTypes.UnorderedList,
						items: [
							translate(
								'FTP (File Transfer Protocol): the original standard for transferring files between servers.'
							),
							translate(
								'SFTP (Secure File Transfer Protocol): is like FTP, but adds a layer of security (SSH encryption).'
							),
							translate(
								'SFTP/SSH is the preferred method to choose. Both methods are supported by Bluehost.'
							),
						],
					},

					{
						type: InfoTypes.Line,
					},
					{
						type: InfoTypes.Link,
						text: translate( 'Read more' ),
						link: 'https://www.bluehost.com/help/article/ssh-access',
					},
				],
			},
			host: [
				{
					type: InfoTypes.Text,
					text: translate(
						'Your Domain Name or server IP address. Both are available from the Bluehost cPanel.'
					),
				},
				{
					type: InfoTypes.Line,
				},
				{
					type: InfoTypes.Link,
					text: translate( 'Visit my Bluehost cPanel' ),
					link: 'https://my.bluehost.com/cgi-bin/cplogin',
				},
			],
			port: {
				ftp: [
					{
						type: InfoTypes.Text,
						text: translate( 'Enter port 21 for Bluehost’s FTP service.' ),
					},
				],
				sftp: [
					{
						type: InfoTypes.Text,
						text: translate(
							'Port 2222 would be used for Bluehost shared and reseller accounts. 22 is the default for Bluehost dedicated & VPS accounts.'
						),
					},
				],
			},
			user: {
				ftp: [
					{
						type: InfoTypes.OrderedList,
						items: [
							translate( 'Login to your Bluehost cPanel' ),
							translate( 'Click the "Advanced" tab towards the left side of the account.' ),
							translate(
								'Choose FTP from the sub-menu, or click the FTP Accounts icon from the Files section.'
							),
							translate( 'Create a new FTP account' ),
						],
					},
					{
						type: InfoTypes.Text,
						text: translate(
							'Your Bluehost username will end with your domain (e.g. test@example.com).'
						),
					},
					{
						type: InfoTypes.Line,
					},
					{
						type: InfoTypes.Link,
						text: translate( 'Visit my Bluehost cPanel' ),
						link: 'https://my.bluehost.com/cgi-bin/cplogin',
					},
				],
				sftp: [
					{
						type: InfoTypes.Text,
						text: translate( 'For Bluehost VPS and dedicated servers, the login will be `root`.' ),
					},
					{
						type: InfoTypes.Text,
						text: translate(
							'If you enable shell access for individual cPanels, the SSH username and password would be the same as the cPanel username and password for those accounts.'
						),
					},
				],
			},
			pass: {
				ftp: [
					{
						type: InfoTypes.OrderedList,
						items: [
							translate( 'Login to your Bluehost cPanel' ),
							translate( 'Click the "Advanced" tab towards the left side of the account.' ),
							translate(
								'Choose FTP from the sub-menu, or click the FTP Accounts icon from the Files section.'
							),
							translate( 'Create a new FTP account' ),
						],
					},
					{
						type: InfoTypes.Text,
						text: translate( 'Your Bluehost FTP password is chosen by you using the tools above.' ),
					},
					{
						type: InfoTypes.Line,
					},
					{
						type: InfoTypes.Link,
						text: translate( 'Visit my Bluehost cPanel' ),
						link: 'https://my.bluehost.com/cgi-bin/cplogin',
					},
				],
				sftp: [
					{
						type: InfoTypes.Text,
						text: translate(
							'If you enable shell access for individual cPanels, the SSH username and password would be the same as the cPanel username and password for those accounts.'
						),
					},
					{
						type: InfoTypes.Line,
					},
					{
						type: InfoTypes.Link,
						text: translate( 'Visit my Bluehost cPanel' ),
						link: 'https://my.bluehost.com/cgi-bin/cplogin',
					},
				],
			},
			mode: [
				{
					type: InfoTypes.Text,
					text: translate(
						'The majority of Bluehost accounts require private key authentication. Bluehost VPS and Dedicated Servers also allow for username and password authentication as secondary option.'
					),
				},
				{
					type: InfoTypes.Line,
				},
				{
					type: InfoTypes.Link,
					text: translate( 'Read more' ),
					link: 'https://www.bluehost.com/help/article/ssh-access',
				},
			],
			kpri: [
				{
					type: InfoTypes.OrderedList,
					items: [
						translate( 'Login to your Bluehost cPanel' ),
						translate( 'Click the "Advanced" tab towards the left side of the account.' ),
						translate( 'Click the Shell Access icon under the Security section.' ),
						translate( 'Click the Manage SSH Keys button' ),
						translate( 'Choose generate a new key and complete the form' ),
					],
				},
				{
					type: InfoTypes.Line,
				},
				{
					type: InfoTypes.Link,
					text: translate( 'Visit my Bluehost cPanel' ),
					link: 'https://my.bluehost.com/cgi-bin/cplogin',
				},
			],
		},
	},
	{
		id: 'dreamhost',
		name: 'Dreamhost',
		supportLink: 'https://www.dreamhost.com/support/',
		credentialLinks: {
			ftp: 'https://help.dreamhost.com/hc/en-us/articles/115000675027-FTP-overview-and-credentials',
			sftp: 'https://help.dreamhost.com/hc/en-us/articles/216385837-Enabling-Shell-access',
		},
	},
	{
		id: 'godaddy',
		name: 'GoDaddy',
		supportLink: 'https://www.godaddy.com/help',
		credentialLinks: {
			sftp: 'https://www.godaddy.com/help/enable-ssh-4942',
		},
	},
	{
		id: 'hostgator',
		name: 'HostGator',
		supportLink: 'https://www.hostgator.com/help',
		credentialLinks: {
			ftp: 'https://www.hostgator.com/help/article/ftp-getting-started',
			sftp: 'https://www.hostgator.com/help/article/how-do-i-start-using-ssl-with-ftp',
		},
	},
	{
		id: 'siteground',
		name: 'Siteground',
		supportLink: 'https://www.siteground.com/kb/category/website/',
		credentialLinks: {
			ftp: 'https://www.siteground.com/kb/establish-ftp-connection-hosting-account/',
		},
	},
	{
		id: 'pressable',
		name: 'Pressable',
		supportLink: 'https://pressable.com/knowledgebase/connect-to-ssh-on-pressable/',
	},
];

export const otherHosts: Host[] = [
	{
		id: 'generic',
		name: 'Other',
		supportLink: 'https://jetpack.com/support/activating-jetpack-backups/',
	},
	{
		id: 'land1',
		name: '1&1',
	},
	{
		id: 'digitalocean',
		name: 'DigitalOcean',
	},

	{
		id: 'flywheel',
		name: 'Flywheel',
	},
	{
		id: 'hostinger',
		name: 'Hostinger',
	},
	{
		id: 'hostmonster',
		name: 'HostMonster',
	},
	{
		id: 'inmotion',
		name: 'InMotion Hosting',
	},
	{
		id: 'ipage',
		name: 'iPage',
	},
	{
		id: 'justhost',
		name: 'Just Host',
	},
	{
		id: 'kinsta',
		name: 'Kinsta',
	},
	{
		id: 'liquidweb',
		name: 'Liquid Web',
	},
	{
		id: 'mediatemple',
		name: 'Media Temple',
	},
	{
		id: 'namecheap',
		name: 'Namecheap',
	},
	{
		id: 'ovh',
		name: 'OVH',
	},
	{
		id: 'pagely',
		name: 'Pagely',
	},
	{
		id: 'pressable',
		name: 'Pressable',
	},
	{
		id: 'wpengine',
		name: 'WPEngine',
	},
	{
		id: 'jurassic_ninja',
		name: 'Jurassic Ninja',
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
