/** @format */

// This file is just to test that i18n can compile strings from multiple js files
// This file itself doesn't need to actually work. :-)
/* global i18n */

function test() {
	// simplest case... just a translation, no special options
	i18n.translate( 'My test has two files.' );
}

module.exports = test;
