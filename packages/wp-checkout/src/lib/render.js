/* @format */

export function renderDisplayValueMarkdown( displayValue ) {
	return displayValue.replace( '/~~([^~]+)~~/', '<s>$1</s>' );
}
