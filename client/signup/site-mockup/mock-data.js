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
		vertical_name: 'Mexican Restaurant',
		vertical_id: 'a8c.3.0.4.1',
		parent: 'a8c.3.0.4',
		preview: {
			title: 'Very Cool Mexican Restaurant',
			cover_image:
				'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=cc14d05af9963bb8ee521c3c4ea6df55&auto=format&fit=crop&w=3134&q=80',
			cover_image_text: 'Fresh and authentic Mexican food.',
			content:
				'<h2>Dedicated to Quality</h2><div class="site-mockup__columns"><div class="site-mockup__column"><img class="site-mockup__block-image" src="https://images.unsplash.com/photo-1526350593220-3a1d7d3c8677?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=4300b572345adea9ed6c828d041a6a28&auto=format&fit=crop&w=660&q=60" /></div><div class="site-mockup__column"><p>Enjoy a unique mix of classic Mexican dishes and innovative house specialties.</p></div></div><div class="site-mockup__columns"><div class="site-mockup__column"><p>Enjoy a unique mix of classic Mexican dishes and innovative house specialties.</p></div><div class="site-mockup__column"><img class="site-mockup__block-image" src="https://images.unsplash.com/photo-1526350593220-3a1d7d3c8677?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=4300b572345adea9ed6c828d041a6a28&auto=format&fit=crop&w=660&q=60" /></div></div>',
		},
	},
	{
		vertical_name: 'Business',
		vertical_id: '',
		parent: '',
		preview: {
			title: 'Company name',
			cover_image: 'https://a8cvm1.files.wordpress.com/2018/12/bonjour-869208_1920.jpg?w=660',
			cover_image_text: 'Welcome! What can we do for you today?',
			content:
				'<h2>About Us</h2><div class="site-mockup__columns"><div class="site-mockup__column"><img class="site-mockup__block-image" src="https://a8cvm1.files.wordpress.com/2018/12/person-801829_1920.jpg?w=120" /></div><div class="site-mockup__column"><p>Work done well, with a personal touch. That’s our commitment!</p></div></div><div class="site-mockup__columns"><div class="site-mockup__column"><p>Our job starts with you: understanding what you need, so we can offer you options that make sense.</p></div><div class="site-mockup__column"><img class="site-mockup__block-image" src="https://a8cvm1.files.wordpress.com/2018/11/pexels-355952.jpg?w=120" /></div></div>',
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
