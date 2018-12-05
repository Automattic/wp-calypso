/** @format */
/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * Internal dependencies
 */

function normalizeVerticalName( name ) {
	return name
		.trim()
		.toLowerCase()
		.replace( /\s/g, '-' );
}

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
];

export function getVerticalData( vertical ) {
	if ( ! vertical ) {
		return {};
	}
	vertical = normalizeVerticalName( vertical );
	// this probably needs to be memoized
	const verticalData = find( verticalList, v => {
		return normalizeVerticalName( v.vertical_name ) === vertical;
	} );
	// todo deal with children that have no preview, use the parent preview
	return verticalData ? verticalData.preview : {};
}
