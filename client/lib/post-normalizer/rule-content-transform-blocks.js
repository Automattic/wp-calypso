import { forEach } from 'lodash';

export default function transformBlocks( post, dom ) {
	const videopresses = dom.querySelectorAll( '.is-provider-videopress' );

	//Loop through each videopress element and replace it with an iframe using the content of the child iv element wp-block-embed__wrapper to get the video URL
	forEach( videopresses, ( videopress ) => {
		const iframe = document.createElement( 'iframe' );
		iframe.src = videopress.querySelector( '.wp-block-embed__wrapper' ).textContent;
		iframe.width = '640';
		iframe.height = '360';
		iframe.frameborder = '0';
		iframe.allowfullscreen = true;
		videopress.parentNode.replaceChild( iframe, videopress );
	} );
	return post;
}
