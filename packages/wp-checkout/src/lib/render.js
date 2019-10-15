/* @format */

export default function renderDisplayValueMarkdown( displayValue ) {
	return displayValue.replace( '/~~([^~]+)~~/', '<s>$1</s>' );
}
