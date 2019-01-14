/** @format */
/**
 * External dependencies
 */
import { isString, find, get } from 'lodash';

/**
 * Internal dependencies
 */

const SIGNUP_SITE_MOCKUP_DEFAULT_VERTICAL_NAME = 'business';

const verticalList = [
	{
		vertical_name: 'Restaurant',
		vertical_id: 'a8c.3.0.4',
		preview: {
			title: 'Your Restaurant',
			content:
				'<!-- wp:cover {"url":"https://a8cvm1p1.files.wordpress.com/2018/11/restaurant.jpg","align":"full","id":42,"dimRatio":20,"className":"has-undefined-content"} -->\n<div class="wp-block-cover has-background-dim-20 has-background-dim alignfull has-undefined-content" style="background-image:url(\'https://a8cvm1p1.files.wordpress.com/2018/11/restaurant.jpg\');"><p class="wp-block-cover-text">Hungry? Your table\u2019s waiting.</p></div>\n<!-- /wp:cover -->\n\n<!-- wp:heading -->\n<h2>About Us</h2>\n<!-- /wp:heading -->\n\n<!-- wp:media-text {"mediaId":30,"mediaType":"image","mediaWidth":60,"isStackedOnMobile":true} -->\n<div class="wp-block-media-text alignwide is-stacked-on-mobile" style="grid-template-columns:60% auto;"><figure class="wp-block-media-text__media"><img src="https://a8cvm1p1.files.wordpress.com/2018/11/chairs-cutlery-fork-9315.jpg?w=710" alt="" class="wp-image-30" /></figure><div class="wp-block-media-text__content"><!-- wp:paragraph {"placeholder":"Content\u2026","fontSize":"small"} -->\n<p class="has-small-font-size">Hospitality: It\u2019s Great food. Friendly staff. A comfortable place to sit and share a meal with people you care about. It\u2019s what we do.</p>\n<!-- /wp:paragraph --></div></div>\n<!-- /wp:media-text -->\n\n<!-- wp:media-text {"mediaPosition":"right","mediaId":39,"mediaType":"image","mediaWidth":60,"isStackedOnMobile":true} -->\n<div class="wp-block-media-text alignwide has-media-on-the-right is-stacked-on-mobile" style="grid-template-columns:auto 60%;"><figure class="wp-block-media-text__media"><img src="https://a8cvm1p1.files.wordpress.com/2018/11/open-sign.jpg?w=710" alt="" class="wp-image-39" /></figure><div class="wp-block-media-text__content"><!-- wp:paragraph {"placeholder":"Content\u2026","fontSize":"small"} -->\n<p class="has-small-font-size">We\u2019re a local, independent business. We\u2019re proud to be your neighbors, and we\u2019re proud to feed you.</p>\n<!-- /wp:paragraph --></div></div>\n<!-- /wp:media-text -->\n\n<!-- wp:separator -->\n<hr class="wp-block-separator" />\n<!-- /wp:separator -->\n\n<!-- wp:heading -->\n<h2>Our Food</h2>\n<!-- /wp:heading -->\n\n<!-- wp:media-text {"mediaId":44,"mediaType":"image","mediaWidth":60,"isStackedOnMobile":true} -->\n<div class="wp-block-media-text alignwide is-stacked-on-mobile" style="grid-template-columns:60% auto;"><figure class="wp-block-media-text__media"><img src="https://a8cvm1p1.files.wordpress.com/2018/12/plated-dish.jpg?w=710" alt="" class="wp-image-44" /></figure><div class="wp-block-media-text__content"><!-- wp:paragraph {"placeholder":"Content\u2026","fontSize":"small"} -->\n<p class="has-small-font-size">Quality ingredients, prepared by people who care. Take a look at our menus to learn more about our food.</p>\n<!-- /wp:paragraph --></div></div>\n<!-- /wp:media-text -->\n\n<!-- wp:media-text {"mediaPosition":"right","mediaId":33,"mediaType":"image","mediaWidth":60,"isStackedOnMobile":true} -->\n<div class="wp-block-media-text alignwide has-media-on-the-right is-stacked-on-mobile" style="grid-template-columns:auto 60%;"><figure class="wp-block-media-text__media"><img src="https://a8cvm1p1.files.wordpress.com/2018/11/degustation-6.jpg?w=710" alt="" class="wp-image-33" /></figure><div class="wp-block-media-text__content"><!-- wp:paragraph {"placeholder":"Content\u2026","fontSize":"small"} -->\n<p class="has-small-font-size">Whether you\u2019re celebrating a special day or just want a night off from your own kitchen, let us serve you \u2014 it\u2019s what we do best.</p>\n<!-- /wp:paragraph --></div></div>\n<!-- /wp:media-text -->\n\n<!-- wp:separator -->\n<hr class="wp-block-separator" />\n<!-- /wp:separator -->\n\n<!-- wp:heading -->\n<h2>Get in Touch</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p><strong>{{CompanyName}}</strong><br>{{Address}}<br>{{Phone}}</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:heading -->\n<h2>Send Us a Message</h2>\n<!-- /wp:heading -->\n\n<!-- wp:jetpack/contact-form {"has_form_settings_set":"yes"} -->\n<!-- wp:jetpack/field-name {"required":true} /-->\n\n<!-- wp:jetpack/field-email {"required":true} /-->\n\n<!-- wp:jetpack/field-textarea /-->\n<!-- /wp:jetpack/contact-form -->\n\n<!-- wp:separator -->\n<hr class="wp-block-separator" />\n<!-- /wp:separator -->\n\n<!-- wp:paragraph {"fontSize":"small"} -->\n<p class="has-small-font-size">Copyright {{CompanyName}} 2018 - All rights reserved<br></p>\n<!-- /wp:paragraph -->',
		},
	},
	{
		vertical_name: 'Business',
		vertical_id: '',
		parent: '',
		preview: {
			title: 'Your Business',
			content:
				'<!-- wp:cover {"url":"https://a8cvm1.files.wordpress.com/2018/12/bonjour-869208_1920.jpg","align":"full","id":123,"dimRatio":20} -->\n<div class="wp-block-cover has-background-dim-20 has-background-dim alignfull" style="background-image:url(\'https://a8cvm1.files.wordpress.com/2018/12/bonjour-869208_1920.jpg\');"><p class="wp-block-cover-text">Welcome! <br>What can we do for you today?</p></div>\n<!-- /wp:cover -->\n\n<!-- wp:heading -->\n<h2>About Us</h2>\n<!-- /wp:heading -->\n\n<!-- wp:media-text {"mediaId":121,"mediaType":"image","mediaWidth":60,"isStackedOnMobile":true} -->\n<div class="wp-block-media-text alignwide is-stacked-on-mobile" style="grid-template-columns:60% auto;"><figure class="wp-block-media-text__media"><img src="https://a8cvm1.files.wordpress.com/2018/12/person-801829_1920.jpg?w=740" alt="" class="wp-image-121" /></figure><div class="wp-block-media-text__content"><!-- wp:paragraph {"placeholder":"Content\u2026","fontSize":"small"} -->\n<p class="has-small-font-size">Work done well, with a personal touch. That\u2019s our commitment!</p>\n<!-- /wp:paragraph --></div></div>\n<!-- /wp:media-text -->\n\n<!-- wp:media-text {"mediaPosition":"right","mediaId":78,"mediaType":"image","mediaWidth":60,"isStackedOnMobile":true} -->\n<div class="wp-block-media-text alignwide has-media-on-the-right is-stacked-on-mobile" style="grid-template-columns:auto 60%;"><figure class="wp-block-media-text__media"><img src="https://a8cvm1.files.wordpress.com/2018/11/pexels-355952.jpg?w=740" alt="" class="wp-image-78" /></figure><div class="wp-block-media-text__content"><!-- wp:paragraph {"placeholder":"Content\u2026","fontSize":"small"} -->\n<p class="has-small-font-size">Our job starts with you: understanding what you need, so we can offer you options that make sense.</p>\n<!-- /wp:paragraph --></div></div>\n<!-- /wp:media-text -->\n\n<!-- wp:separator -->\n<hr class="wp-block-separator" />\n<!-- /wp:separator -->\n\n<!-- wp:heading -->\n<h2>Products and Services</h2>\n<!-- /wp:heading -->\n\n<!-- wp:media-text {"mediaId":117,"mediaType":"image","mediaWidth":60,"isStackedOnMobile":true} -->\n<div class="wp-block-media-text alignwide is-stacked-on-mobile" style="grid-template-columns:60% auto;"><figure class="wp-block-media-text__media"><img src="https://a8cvm1.files.wordpress.com/2018/11/cashual-meeting.jpg?w=740" alt="" class="wp-image-117" /></figure><div class="wp-block-media-text__content"><!-- wp:paragraph {"placeholder":"Content\u2026","fontSize":"small"} -->\n<p class="has-small-font-size">Not sure what you need, or what it costs? We\'re here to help.</p>\n<!-- /wp:paragraph --></div></div>\n<!-- /wp:media-text -->\n\n<!-- wp:media-text {"mediaPosition":"right","mediaId":118,"mediaType":"image","mediaWidth":60,"isStackedOnMobile":true} -->\n<div class="wp-block-media-text alignwide has-media-on-the-right is-stacked-on-mobile" style="grid-template-columns:auto 60%;"><figure class="wp-block-media-text__media"><img src="https://a8cvm1.files.wordpress.com/2018/11/phone-table.jpg?w=740" alt="" class="wp-image-118" /></figure><div class="wp-block-media-text__content"><!-- wp:paragraph {"placeholder":"Content\u2026","fontSize":"small"} -->\n<p class="has-small-font-size">We\'re always happy to talk about how we can best serve you.</p>\n<!-- /wp:paragraph --></div></div>\n<!-- /wp:media-text -->\n\n<!-- wp:separator -->\n<hr class="wp-block-separator" />\n<!-- /wp:separator -->\n\n<!-- wp:heading -->\n<h2>Get in Touch</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph {"align":"left"} -->\n<p style="text-align:left;"><strong>{{CompanyName}}</strong><br>{{Address}}<br>{{Phone}}</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:heading -->\n<h2>Send Us a Message</h2>\n<!-- /wp:heading -->\n\n<!-- wp:jetpack/contact-form {"has_form_settings_set":"yes"} -->\n<!-- wp:jetpack/field-name {"required":true} /-->\n\n<!-- wp:jetpack/field-email {"required":true} /-->\n\n<!-- wp:jetpack/field-textarea /-->\n<!-- /wp:jetpack/contact-form -->\n\n<!-- wp:separator -->\n<hr class="wp-block-separator" />\n<!-- /wp:separator -->\n\n<!-- wp:paragraph {"fontSize":"small"} -->\n<p class="has-small-font-size">Copyright {{CompanyName}} 2018 - All rights reserved<br></p>\n<!-- /wp:paragraph -->',
		},
	},
	{
		vertical_name: 'Local Services',
		vertical_id: '',
		parent: '',
		preview: {
			title: 'Your Business',
			content:
				'<!-- wp:cover {"url":"https://a8cvm1p2.files.wordpress.com/2018/11/row-houses.jpg","align":"full","id":35,"dimRatio":20,"className":"has-undefined-content"} -->\n<div class="wp-block-cover has-background-dim-20 has-background-dim alignfull has-undefined-content" style="background-image:url(\'https://a8cvm1p2.files.wordpress.com/2018/11/row-houses.jpg\');"><p class="wp-block-cover-text">How can we help?</p></div>\n<!-- /wp:cover -->\n\n<!-- wp:heading -->\n<h2>Our Services</h2>\n<!-- /wp:heading -->\n\n<!-- wp:media-text {"mediaId":34,"mediaType":"image","mediaWidth":60,"isStackedOnMobile":true} -->\n<div class="wp-block-media-text alignwide is-stacked-on-mobile" style="grid-template-columns:60% auto;"><figure class="wp-block-media-text__media"><img src="https://a8cvm1p2.files.wordpress.com/2018/11/cashual-meeting.jpg?w=710" alt="" class="wp-image-34" /></figure><div class="wp-block-media-text__content"><!-- wp:paragraph {"placeholder":"Content\u2026","fontSize":"small"} -->\n<p class="has-small-font-size">A job well done, with a personal touch \u2014 that\u2019s our commitment to you.</p>\n<!-- /wp:paragraph --></div></div>\n<!-- /wp:media-text -->\n\n<!-- wp:media-text {"mediaPosition":"right","mediaId":40,"mediaType":"image","mediaWidth":60,"isStackedOnMobile":true} -->\n<div class="wp-block-media-text alignwide has-media-on-the-right is-stacked-on-mobile" style="grid-template-columns:auto 60%;"><figure class="wp-block-media-text__media"><img src="https://a8cvm1p2.files.wordpress.com/2018/12/illuminated-1853924_1920.jpg?w=710" alt="" class="wp-image-40" /></figure><div class="wp-block-media-text__content"><!-- wp:paragraph {"placeholder":"Content\u2026","fontSize":"small"} -->\n<p class="has-small-font-size">Not sure what you need, or what it costs? Get in touch: We can explain what services are right for you and tell you more about our fees.</p>\n<!-- /wp:paragraph --></div></div>\n<!-- /wp:media-text -->\n\n<!-- wp:separator -->\n<hr class="wp-block-separator" />\n<!-- /wp:separator -->\n\n<!-- wp:heading -->\n<h2>We\'re Here to Help</h2>\n<!-- /wp:heading -->\n\n<!-- wp:media-text {"mediaId":37,"mediaType":"image","mediaWidth":60,"isStackedOnMobile":true} -->\n<div class="wp-block-media-text alignwide is-stacked-on-mobile" style="grid-template-columns:60% auto;"><figure class="wp-block-media-text__media"><img src="https://a8cvm1p2.files.wordpress.com/2018/11/dog-porch.jpg?w=710" alt="" class="wp-image-37" /></figure><div class="wp-block-media-text__content"><!-- wp:paragraph {"placeholder":"Content\u2026","fontSize":"small"} -->\n<p class="has-small-font-size">The best help is help that\u2019s nearby. We\u2019re in your neighborhood-- we know what it\u2019s like to live here, too!</p>\n<!-- /wp:paragraph --></div></div>\n<!-- /wp:media-text -->\n\n<!-- wp:media-text {"mediaPosition":"right","mediaId":38,"mediaType":"image","mediaWidth":60,"isStackedOnMobile":true} -->\n<div class="wp-block-media-text alignwide has-media-on-the-right is-stacked-on-mobile" style="grid-template-columns:auto 60%;"><figure class="wp-block-media-text__media"><img src="https://a8cvm1p2.files.wordpress.com/2018/11/phone-table.jpg?w=710" alt="" class="wp-image-38" /></figure><div class="wp-block-media-text__content"><!-- wp:paragraph {"placeholder":"Content\u2026","fontSize":"small"} -->\n<p class="has-small-font-size">Ready to get started? We\u2019re just a phone call away.</p>\n<!-- /wp:paragraph --></div></div>\n<!-- /wp:media-text -->\n\n<!-- wp:separator -->\n<hr class="wp-block-separator" />\n<!-- /wp:separator -->\n\n<!-- wp:heading -->\n<h2>Get in Touch</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p><strong>{{CompanyName}}</strong><br>{{address}}<br>{{Phone}}<br></p>\n<!-- /wp:paragraph -->\n\n<!-- wp:heading -->\n<h2>Send Us a Message</h2>\n<!-- /wp:heading -->\n\n<!-- wp:jetpack/contact-form {"has_form_settings_set":"yes"} -->\n<!-- wp:jetpack/field-name {"required":true} /-->\n\n<!-- wp:jetpack/field-email {"required":true} /-->\n\n<!-- wp:jetpack/field-textarea /-->\n<!-- /wp:jetpack/contact-form -->\n\n<!-- wp:separator -->\n<hr class="wp-block-separator" />\n<!-- /wp:separator -->\n\n<!-- wp:paragraph {"fontSize":"small"} -->\n<p class="has-small-font-size">Copyright {{CompanyName}} 2018 - All rights reserved<br></p>\n<!-- /wp:paragraph -->',
		},
	},
];

const defaultPreviewData = getVerticalDataPreview(
	SIGNUP_SITE_MOCKUP_DEFAULT_VERTICAL_NAME,
	verticalList
);

function normalizeVerticalName( name ) {
	return isString( name )
		? name
				.trim()
				.toLowerCase()
				.replace( /\s/g, '-' )
		: '';
}

function getVerticalDataPreview( verticalName, verticalCollection ) {
	verticalName = normalizeVerticalName( verticalName );
	return (
		get(
			find( verticalCollection, v => {
				return normalizeVerticalName( v.vertical_name ) === verticalName;
			} ),
			'preview',
			null
		) || defaultPreviewData
	);
}

export function getVerticalData( vertical = SIGNUP_SITE_MOCKUP_DEFAULT_VERTICAL_NAME ) {
	// this probably needs to be memoized
	return getVerticalDataPreview( vertical, verticalList );
}
