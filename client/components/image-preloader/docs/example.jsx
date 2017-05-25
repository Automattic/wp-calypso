
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ImagePreloader from 'components/image-preloader';

export default class ImagePreloaderExample extends React.Component {
	static displayName = 'ImagePreloaderExample';
	render() {
		return <ImagePreloader
			placeholder={ <div>Loading...</div> }
			src="https://en-blog.files.wordpress.com/2016/08/photo-1441109296207-fd911f7cd5e5.jpg" />;
	}
}
