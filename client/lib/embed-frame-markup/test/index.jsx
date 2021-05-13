/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import generateEmbedFrameMarkup from '../';

describe( '#generateEmbedFrameMarkup()', () => {
	test( 'should return an empty string if no arguments passed', () => {
		expect( generateEmbedFrameMarkup() ).to.equal( '' );
	} );

	test( 'should generate markup with the body contents', () => {
		expect( generateEmbedFrameMarkup( { body: 'Hello World' } ) ).to.equal(
			'<html><head><style>a { cursor: default; }</style></head><body style="margin:0"><div>Hello World</div><script src="https://s0.wp.com/wp-includes/js/jquery/jquery.js"></script><script>\n\t\t\t\t\t[ \'click\', \'dragstart\' ].forEach( function( type ) {\n\t\t\t\t\t\tdocument.addEventListener( type, function( event ) {\n\t\t\t\t\t\t\tevent.preventDefault();\n\t\t\t\t\t\t\tevent.stopImmediatePropagation();\n\t\t\t\t\t\t}, true );\n\t\t\t\t\t} );\n\t\t\t\t</script></body></html>'
		);
	} );

	test( 'should generate markup with styles', () => {
		const styles = {
			'jetpack-carousel': {
				src:
					'https://s1.wp.com/wp-content/mu-plugins/carousel/jetpack-carousel.css?m=1458924076h&ver=20120629',
				media: 'all',
			},
		};

		expect( generateEmbedFrameMarkup( { styles } ) ).to.equal(
			'<html><head><link rel="stylesheet" media="all" href="https://s1.wp.com/wp-content/mu-plugins/carousel/jetpack-carousel.css?m=1458924076h&amp;ver=20120629"/><style>a { cursor: default; }</style></head><body style="margin:0"><div></div><script src="https://s0.wp.com/wp-includes/js/jquery/jquery.js"></script><script>\n\t\t\t\t\t[ \'click\', \'dragstart\' ].forEach( function( type ) {\n\t\t\t\t\t\tdocument.addEventListener( type, function( event ) {\n\t\t\t\t\t\t\tevent.preventDefault();\n\t\t\t\t\t\t\tevent.stopImmediatePropagation();\n\t\t\t\t\t\t}, true );\n\t\t\t\t\t} );\n\t\t\t\t</script></body></html>'
		);
	} );

	test( 'should generate markup with scripts', () => {
		const scripts = {
			'jetpack-facebook-embed': {
				src: 'https://s2.wp.com/wp-content/mu-plugins/shortcodes/js/facebook.js?ver',
				extra: 'var jpfbembed = {"appid":"249643311490"};',
			},
		};

		expect( generateEmbedFrameMarkup( { scripts } ) ).to.equal(
			'<html><head><style>a { cursor: default; }</style></head><body style="margin:0"><div></div><script src="https://s0.wp.com/wp-includes/js/jquery/jquery.js"></script><script>\n\t\t\t\t\t[ \'click\', \'dragstart\' ].forEach( function( type ) {\n\t\t\t\t\t\tdocument.addEventListener( type, function( event ) {\n\t\t\t\t\t\t\tevent.preventDefault();\n\t\t\t\t\t\t\tevent.stopImmediatePropagation();\n\t\t\t\t\t\t}, true );\n\t\t\t\t\t} );\n\t\t\t\t</script><script>var jpfbembed = {"appid":"249643311490"};</script><script src="https://s2.wp.com/wp-content/mu-plugins/shortcodes/js/facebook.js?ver"></script></body></html>'
		);
	} );
} );
