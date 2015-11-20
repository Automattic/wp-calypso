var i18n = require( 'lib/mixins/i18n' );

module.exports = {
	countryViews: [
		{
			icon: 'https://secure.gravatar.com/blavatar/9f4faa5ad0c723474f7a6d810172447c?s=48',
			label: 'United States',
			region: '021',
			value: 68
		}, {
			icon: 'https://secure.gravatar.com/blavatar/b9d80c42eb6af7503f8eb1cd1e88659c?s=48',
			label: 'Ireland',
			region: '154',
			value: 23
		}
	],
	referrers: [
		{
			icon: 'https://secure.gravatar.com/blavatar/4cdb265b8260a6a032a1ed197e39b92d?s=48',
			label: 'WordPress.com',
			value: 82,
			link: 'http://wordpress.com',
			gridicon: 'external'
		}, {
			icon: 'https://secure.gravatar.com/blavatar/6741a05f4bc6e5b65f504c4f3df388a1?s=48',
			label: 'Google Search',
			value: 75,
			link: 'http://google.com',
			gridicon: 'external'
		}, {
			icon: 'https://secure.gravatar.com/blavatar/5029a4a8e7da221ae517ddaa0dd5422b?s=48',
			label: 'Yahoo Search',
			value: 54,
			link: 'http://yahoo.com',
			gridicon: 'external'
		}, {
			icon: null,
			label: 'techcrunch.com',
			value: 16,
			link: 'http://techcrunch.com',
			gridicon: 'external'
		}, {
			icon: null,
			label: 'news.com',
			value: 10,
			link: 'http://news.com',
			gridicon: 'external'
		}, {
			icon: 'https://secure.gravatar.com/blavatar/7905d1c4e12c54933a44d19fcd5f9356?s=48',
			label: 'Twitter',
			value: 7,
			link: 'http://twitter.com',
			gridicon: 'external'
		}
	],
	insights: {
		day: i18n.moment().day( 'Tuesday' ).format( 'dddd' ),
		percent: 45,
		hour: i18n.moment().hour( 8 ).startOf( 'hour' ).format( 'LT' ),
		hour_percent: 52
	}
};
