import { getQueryArgs } from '@wordpress/url';
import doPressThis from '../../lib/do-press-this';

const { url, title, text, image, embed } = getQueryArgs( window.location.href );

if ( url ) {
	doPressThis( { url, title, text, image, embed } );
}
