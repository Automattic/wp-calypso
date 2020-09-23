interface HostInfo {
	name: string;
	ftp: string | false;
	sftp: string | false;
	ssh: string | false;
	inline: string | false;
	top: boolean;
}

export const hosts: { [ id: string ]: HostInfo } = {
	generic: {
		name: 'Other',
		ftp: 'TBC - jetpack.com page',
		sftp: 'TBC - jetpack.com page',
		ssh: 'TBC - jetpack.com page',
		inline: 'TBC - jetpack.com page?',
		top: false,
	},
	'1and1': {
		name: '1&1',
		ftp: false,
		sftp:
			'https://www.ionos.com/help/server-cloud-infrastructure/accordions-to-managed-cloud-hosting/sftp-ssh/activating-sftpssh-access/',
		ssh:
			'https://www.ionos.com/help/server-cloud-infrastructure/accordions-to-managed-cloud-hosting/sftp-ssh/activating-sftpssh-access/',
		inline: false,
		top: false,
	},
	amazon: {
		name: 'Amazon / AWS',
		ftp: false,
		sftp: 'https://docs.aws.amazon.com/transfer/latest/userguide/create-server-sftp.html ',
		ssh: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AccessingInstancesLinux.html',
		inline: false,
		top: true,
	},
	bluehost: {
		name: 'Bluehost',
		ftp: 'https://my.bluehost.com/cgi/help/ftpaccounts',
		sftp: 'https://my.bluehost.com/cgi/help/ftpaccounts',
		ssh: 'https://www.bluehost.com/help/article/ssh-access',
		inline: 'TBC - jetpack.com page',
		top: true,
	},
	digitalocean: {
		name: 'DigitalOcean',
		ftp: false,
		sftp:
			'https://www.digitalocean.com/community/tutorials/how-to-use-sftp-to-securely-transfer-files-with-a-remote-server#how-to-connect-with-sftp (SFTP)',
		ssh: 'https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys--2 ',
		inline: false,
		top: false,
	},
	dreamhost: {
		name: 'Dreamhost',
		ftp: 'https://help.dreamhost.com/hc/en-us/articles/115000675027',
		sftp: 'https://help.dreamhost.com/hc/en-us/articles/115000675027',
		ssh: 'https://help.dreamhost.com/hc/en-us/articles/216385837-Enabling-Shell-access',
		inline: false,
		top: true,
	},
	flywheel: {
		name: 'Flywheel',
		ftp: false,
		sftp: 'https://getflywheel.com/wordpress-support/how-do-i-access-my-site-via-sftp/',
		ssh: false,
		inline: false,
		top: false,
	},
	godaddy: {
		name: 'GoDaddy',
		ftp: false,
		sftp: 'https://www.godaddy.com/help/upload-files-with-sftp-8940',
		ssh: 'https://www.godaddy.com/help/enable-ssh-24596',
		inline: false,
		top: true,
	},
	hostgator: {
		name: 'HostGator',
		ftp: 'https://www.hostgator.com/help/article/ftp-settings-and-connection',
		sftp: 'https://www.hostgator.com/help/article/secure-ftp-sftp-and-ftps',
		ssh: 'https://www.hostgator.com/help/article/how-do-i-get-and-use-ssh-access',
		inline: false,
		top: true,
	},
	hostinger: {
		name: 'Hostinger',
		ftp: 'https://www.hostinger.com/how-to/i-m-having-trouble-connecting-to-ftp-what-should-i-do',
		sftp: 'https://www.hostinger.com/how-to/do-you-provide-sftp-access',
		ssh: 'https://www.hostinger.com/how-to/how-can-i-log-in-onto-my-account-via-ssh',
		inline: false,
		top: false,
	},
	hostmonster: {
		name: 'HostMonster',
		ftp: 'https://my.hostmonster.com/hosting/help/ftpaccounts',
		sftp: 'https://my.hostmonster.com/hosting/help/ftpaccounts',
		ssh: 'https://my.hostmonster.com/hosting/help/180',
		inline: false,
		top: false,
	},
	inmotion: {
		name: 'InMotion Hosting',
		ftp: 'https://www.inmotionhosting.com/support/website/ftp/getting-started-guide/',
		sftp: 'https://www.inmotionhosting.com/support/website/ftp/shared-sftp-setup/',
		ssh: 'https://www.inmotionhosting.com/support/website/ssh/shared-reseller-ssh',
		inline: false,
		top: false,
	},
	ipage: {
		name: 'iPage',
		ftp: 'https://www.ipage.com/help/article/ftp-how-to-connect-to-your-website',
		sftp: 'https://www.ipage.com/help/article/ftp-how-to-connect-to-your-website',
		ssh: false,
		inline: false,
		top: false,
	},
	justhost: {
		name: 'Just Host',
		ftp: 'https://my.justhost.com/hosting/help/ftpaccounts',
		sftp: 'https://my.justhost.com/hosting/help/ftpaccounts',
		ssh: 'https://my.justhost.com/hosting/help/180',
		inline: false,
		top: false,
	},
	kinsta: {
		name: 'Kinsta',
		ftp: false,
		sftp: 'https://kinsta.com/knowledgebase/how-to-use-sftp/',
		ssh: 'https://kinsta.com/knowledgebase/connect-to-ssh/',
		inline: false,
		top: false,
	},
	liquidweb: {
		name: 'Liquid Web',
		ftp: false,
		sftp: 'https://www.liquidweb.com/kb/finding-sftpssh-credentials-managed-wordpress-portal/',
		ssh: 'https://www.liquidweb.com/kb/finding-sftpssh-credentials-managed-wordpress-portal/',
		inline: false,
		top: false,
	},
	mediatemple: {
		name: 'Media Temple',
		ftp:
			'https://mediatemple.net/community/products/dv/204643370/using-ftp-and-sftp#gs/What_you_need_gs',
		sftp:
			'https://mediatemple.net/community/products/dv/204643370/using-ftp-and-sftp#gs/What_you_need_gs',
		ssh:
			'https://mediatemple.net/community/products/dv/204403684/connecting-via-ssh-to-your-server',
		inline: false,
		top: false,
	},
	namecheap: {
		name: 'Namecheap',
		ftp:
			'https://www.namecheap.com/support/knowledgebase/article.aspx/188/205/how-to-access-an-account-via-ftp',
		sftp:
			'https://www.namecheap.com/support/knowledgebase/article.aspx/188/205/how-to-access-an-account-via-ftp',
		ssh:
			'https://www.namecheap.com/support/knowledgebase/article.aspx/1016/89/how-to-access-a-hosting-account-via-ssh',
		inline: false,
		top: false,
	},
	ovh: {
		name: 'OVH',
		ftp: 'https://docs.ovh.com/gb/en/hosting/web_hosting_filezilla_user_guide/#ftp-connection',
		sftp: 'https://docs.ovh.com/gb/en/hosting/web_hosting_filezilla_user_guide/#sftp-connection',
		ssh:
			'https://docs.ovh.com/gb/en/hosting/web_hosting_ssh_on_web_hosting_packages/#connecting-to-your-server-via-ssh',
		inline: false,
		top: false,
	},
	pagely: {
		name: 'Pagely',
		ftp: false,
		sftp: 'https://support.pagely.com/hc/en-us/articles/203115864-Using-SFTP-With-Pagely',
		ssh:
			'https://support.pagely.com/hc/en-us/articles/227315588-Using-SSH-on-your-VPS-Enterprise-Server',
		inline: false,
		top: false,
	},
	pressable: {
		name: 'Pressable',
		ftp: false,
		sftp: 'https://pressable.com/knowledgebase/ftp-access-through-pressable-sftp-tools/',
		ssh: false,
		inline: false,
		top: false,
	},
	siteground: {
		name: 'Siteground',
		ftp: 'https://www.siteground.com/kb/establish-ftp-connection-hosting-account/',
		sftp:
			'https://www.siteground.com/kb/how_to_establish_sftp_connection_to_hosting_with_filezilla',
		ssh: 'https://www.siteground.com/kb/cpanel/enable-ssh-shell-access-cpanel/',
		inline: false,
		top: true,
	},
	wpengine: {
		name: 'WPEngine',
		ftp: false,
		sftp: 'https://wpengine.com/support/sftp/#Connect_to_SFTP',
		ssh: 'https://wpengine.com/support/ssh-keys-for-shell-access/',
		inline: false,
		top: false,
	},
};

export const getProviderNameFromId = ( searchId?: string ) => {
	for ( const id in hosts ) {
		if ( id === searchId ) {
			return hosts[ id ].name;
		}
	}
	return null;
};
