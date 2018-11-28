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

const defaultVerticalData = {
	vertical_name: 'Default',
	vertical_id: 'a8c.0',
	preview: {
		title: 'My awesome WordPress site',
		cover_image:
			'https://images.unsplash.com/photo-1542325823-53124d9c5cbe?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=5441d8034187fec24a8d9ea0d5e634e6&auto=format&fit=crop&w=3134&q=80',
		cover_image_text: 'Imagine the Synergy',
		content:
			'<img class="featured-image" src="https://images.unsplash.com/photo-1543270915-a8381a52e201?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=ac686dc4d32458c9afcf6ae578501b6e&auto=format&fit=crop&w=200&h=115&q=60" /><h2>The Journey Begins</h2>Here is some content that will make you change your life.',
	},
};

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
				'<img class="featured-image" src="https://images.unsplash.com/photo-1526350593220-3a1d7d3c8677?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=4300b572345adea9ed6c828d041a6a28&auto=format&fit=crop&w=200&q=60" /><h2>Dedicated to quality</h2><div class="entry-content">Enjoy a unique mix of classic Mexican dishes and innovative house specialties.</div>',
		},
	},
];

export function getVerticalData( vertical ) {
	if ( ! vertical ) {
		return defaultVerticalData.preview;
	}
	vertical = normalizeVerticalName( vertical );
	// this probably needs to be memoized
	const verticalData = find( verticalList, v => {
		return normalizeVerticalName( v.vertical_name ) === vertical;
	} );
	// todo deal with children that have no preview, use the parent preview
	return verticalData ? verticalData.preview : defaultVerticalData.preview;
}
