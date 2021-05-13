/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import ImagePreloader from 'calypso/components/image-preloader';

const ImagePreloaderExample = () => (
	<ImagePreloader
		placeholder={ <div>Loading...</div> }
		src="https://en-blog.files.wordpress.com/2016/08/photo-1441109296207-fd911f7cd5e5.jpg"
	/>
);

ImagePreloaderExample.displayName = 'ImagePreloaderExample';

export default ImagePreloaderExample;
