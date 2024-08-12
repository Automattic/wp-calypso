'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
var dom_1 = require( '../utils/dom' );
// We use m or w because these two characters take up the maximum width.
// And we use a LLi so that the same matching fonts can get separated.
var testString = 'mmMwWLliI0O&1';
// We test using 48px font size, we may use any size. I guess larger the better.
var textSize = '48px';
// A font will be compared against all the three default fonts.
// And if for any default fonts it doesn't match, then that font is available.
var baseFonts = [ 'monospace', 'sans-serif', 'serif' ];
var fontList = [
	// This is android-specific font from "Roboto" family
	'sans-serif-thin',
	'ARNO PRO',
	'Agency FB',
	'Arabic Typesetting',
	'Arial Unicode MS',
	'AvantGarde Bk BT',
	'BankGothic Md BT',
	'Batang',
	'Bitstream Vera Sans Mono',
	'Calibri',
	'Century',
	'Century Gothic',
	'Clarendon',
	'EUROSTILE',
	'Franklin Gothic',
	'Futura Bk BT',
	'Futura Md BT',
	'GOTHAM',
	'Gill Sans',
	'HELV',
	'Haettenschweiler',
	'Helvetica Neue',
	'Humanst521 BT',
	'Leelawadee',
	'Letter Gothic',
	'Levenim MT',
	'Lucida Bright',
	'Lucida Sans',
	'Menlo',
	'MS Mincho',
	'MS Outlook',
	'MS Reference Specialty',
	'MS UI Gothic',
	'MT Extra',
	'MYRIAD PRO',
	'Marlett',
	'Meiryo UI',
	'Microsoft Uighur',
	'Minion Pro',
	'Monotype Corsiva',
	'PMingLiU',
	'Pristina',
	'SCRIPTINA',
	'Segoe UI Light',
	'Serifa',
	'SimHei',
	'Small Fonts',
	'Staccato222 BT',
	'TRAJAN PRO',
	'Univers CE 55 Medium',
	'Vrinda',
	'ZWAdobeF',
];
// kudos to http://www.lalit.org/lab/javascript-css-font-detect/
function getFonts() {
	// Running the script in an iframe makes it not affect the page look and not be affected by the page CSS. See:
	// https://github.com/fingerprintjs/fingerprintjs/issues/592
	// https://github.com/fingerprintjs/fingerprintjs/issues/628
	return ( 0, dom_1.withIframe )( function ( _, _a ) {
		var document = _a.document;
		var holder = document.body;
		holder.style.fontSize = textSize;
		// div to load spans for the default fonts and the fonts to detect
		var spansContainer = document.createElement( 'div' );
		var defaultWidth = {};
		var defaultHeight = {};
		// creates a span where the fonts will be loaded
		var createSpan = function ( fontFamily ) {
			var span = document.createElement( 'span' );
			var style = span.style;
			style.position = 'absolute';
			style.top = '0';
			style.left = '0';
			style.fontFamily = fontFamily;
			span.textContent = testString;
			spansContainer.appendChild( span );
			return span;
		};
		// creates a span and load the font to detect and a base font for fallback
		var createSpanWithFonts = function ( fontToDetect, baseFont ) {
			return createSpan( "'".concat( fontToDetect, "'," ).concat( baseFont ) );
		};
		// creates spans for the base fonts and adds them to baseFontsDiv
		var initializeBaseFontsSpans = function () {
			return baseFonts.map( createSpan );
		};
		// creates spans for the fonts to detect and adds them to fontsDiv
		var initializeFontsSpans = function () {
			// Stores {fontName : [spans for that font]}
			var spans = {};
			var _loop_1 = function ( font ) {
				spans[ font ] = baseFonts.map( function ( baseFont ) {
					return createSpanWithFonts( font, baseFont );
				} );
			};
			for ( var _i = 0, fontList_1 = fontList; _i < fontList_1.length; _i++ ) {
				var font = fontList_1[ _i ];
				_loop_1( font );
			}
			return spans;
		};
		// checks if a font is available
		var isFontAvailable = function ( fontSpans ) {
			return baseFonts.some( function ( baseFont, baseFontIndex ) {
				return (
					fontSpans[ baseFontIndex ].offsetWidth !== defaultWidth[ baseFont ] ||
					fontSpans[ baseFontIndex ].offsetHeight !== defaultHeight[ baseFont ]
				);
			} );
		};
		// create spans for base fonts
		var baseFontsSpans = initializeBaseFontsSpans();
		// create spans for fonts to detect
		var fontsSpans = initializeFontsSpans();
		// add all the spans to the DOM
		holder.appendChild( spansContainer );
		// get the default width for the three base fonts
		for ( var index = 0; index < baseFonts.length; index++ ) {
			defaultWidth[ baseFonts[ index ] ] = baseFontsSpans[ index ].offsetWidth; // width for the default font
			defaultHeight[ baseFonts[ index ] ] = baseFontsSpans[ index ].offsetHeight; // height for the default font
		}
		// check available fonts
		return fontList.filter( function ( font ) {
			return isFontAvailable( fontsSpans[ font ] );
		} );
	} );
}
exports.default = getFonts;
