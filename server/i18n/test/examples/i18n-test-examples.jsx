// // This file is just an example of different translation requests that will be parsed as part of the test. This file itself doesn't need to actually work. :-)
/*eslint-disable */
/* global i18n:false, howManyHats, getCity, getZip, React */
function test() {
	// simplest case... just a translation, no special options
	var content = i18n.translate( 'My hat has three corners.' );

	// or it could also be called like this
	content = i18n.translate( { original: 'My hat has three corners too.' } );

	// pluralization
	var numHats = howManyHats(); // returns integer
	content = i18n.translate( {
		original: {
			single: 'My hat has three corners.',
			plural: 'My hats have three corners.',
			count: numHats
		}
	} );

	// providing context
	content = i18n.translate( {
		original: 'post',
		context: 'verb'
	} );

	// passing string as initial argument
	content = i18n.translate( 'post2', { context: 'verb2' } );

	// add a comment to the translator
	content = i18n.translate( {
		original: 'g:i:s a',
		comment: 'draft saved date format, see http://php.net/date'
	} );

	// sprintf-style string substitution
	// NOTE: You can also pass args as an array,
	// although named arguments are more explicit and encouraged
	// See http://www.diveintojavascript.com/projects/javascript-sprintf
	var city = getCity(), // returns string
		zip = getZip(); // returns string

	content = i18n.translate( {
		original: 'Your city is %(city)s and your zip is %(zip)s.',
		args: {
			city: city,
			zip: zip
		}
	} );

	// test the new syntax for translating plurals
	content = i18n.translate( 'single test', 'plural test', { count: 1 } );

	// count should accept a variable placeholder
	var varCount = 1;
	content = i18n.translate( 'single test2', 'plural test2', { count: varCount } );

	// test the ability to break strings to multiple lines
	content = <div>{ i18n.translate(
		"This is a multi-line translation with \"mixed quotes\" " +
		'and mixed \'single quotes\''
	) }</div>;

	content = this.translate( 'The string key text',
		{ 'context': 'context with a literal string key' } );

	content = this.translate( `A string template with no interpolation` );
}

module.exports = test;
/*eslint-enable */
