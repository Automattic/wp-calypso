#!/usr/bin/env node
const parser = require( '../node_modules/pegjs/lib/parser.js' );
const fs = require( 'fs' );
const path = require( 'path' );
const grammarSource = fs.readFileSync( './blocks/api/post.pegjs', 'utf8' );
const grammar = parser.parse( grammarSource );

function escape( text ) {
	return text
		.replace( /\t/g, '\\t' )
		.replace( /\r/g, '\\r' )
		.replace( /\n/g, '\\n' )
		.replace( /\&/g, '&amp;' )
		.replace( /</g, '&lt;' );
}

function isGroup( expression ) {
	return [
		'choice',
		'action',
		'labeled',
		'sequence',
	].indexOf( expression.type ) >= 0;
}

function flattenUnary( expression ) {
	const shouldWrap = isGroup( expression );
	const inner = flatten( expression );
	return shouldWrap ? '(' + inner + ')' : inner;
}

function flatten( expression ) {
	switch ( expression.type ) {
		// Terminal
		case 'any':
			return '.';
		case 'rule_ref':
			return expression.name;
		case 'literal':
			return '"' + escape( expression.value ) + '"';
		case 'class':
			return (
				'[' + ( expression.inverted ? '^' : '' ) +
				expression.parts.map( ( part ) =>
					escape( Array.isArray( part ) ? part.join( '-' ) : part )
				).join( '' ) +
				']' + ( expression.ignoreCase ? 'i' : '' )
			);

		// Unary
		case 'zero_or_more':
			return flattenUnary( expression.expression ) + '*';
		case 'one_or_more':
			return flattenUnary( expression.expression ) + '+';
		case 'optional':
			return flattenUnary( expression.expression ) + '?';
		case 'simple_not':
			return '!' + flattenUnary( expression.expression );

		// Other groups
		case 'sequence':
			return expression.elements.map( flatten ).join( ' ' );
		case 'choice':
			const sep = expression.isRuleTop ? '\n  / ' : ' / ';
			return expression.alternatives.map( flatten ).join( sep );
		case 'group':
			return '(' + flatten( expression.expression ) + ')';
		case 'text':
			// Avoid double parentheses
			const inner = flatten( expression.expression );
			const shouldWrap = inner.indexOf( '(' ) !== 0;
			return shouldWrap ? '$(' + inner + ')' : '$' + inner;
		case 'action':
		case 'labeled':
		case 'named':
			return flatten( expression.expression );

		// Top-level formatting
		case 'grammar':
			return `<dl>${ expression.rules.map( flatten ).join( '' ) }</dl>`;
		case 'rule':
			expression.expression.isRuleTop = true;
			const displayName = expression.expression.type === 'named' ?
				expression.expression.name : '';
			return `<dt>${ displayName }</dt>` +
				`<dd><pre><header>${ expression.name }</header>  = ` +
				`${ flatten( expression.expression ) }</pre></dd>`;

		default:
			throw new Error( JSON.stringify( expression ) );
	}
}

fs.writeFileSync(
	path.join( __dirname, '..', 'docs', 'grammar.md' ), `
# The Gutenberg block grammar

<style>
	dl { display: flex; flex-wrap: wrap; font-size: 110%; }
	dt, dd { flex: 40%; margin-bottom: 1em; }
	dt { text-align: right; font-style: italic; font-size: 105%; }
	dd header { font-weight: bold; }
	pre { margin: 0; }
</style>
${ flatten( grammar ) }
` );
