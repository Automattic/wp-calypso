import React from 'react';

import { html as toHtml } from '../indices-to-html';
import { pickBy, get } from 'lodash';

/**
 * Adds markup to some common text patterns
 *
 *  - Bullet lists
 *  - Todo lists, WP style
 *  - Inline `code` snippets
 *  - Code fences
 *  - Header: description/explanation paragraphs
 *
 * Note: This code is only meant to serve until a
 * proper parser can be built up to convert the
 * unstructured text into structured data. Since at
 * this time we still create HTML strings directly
 * and on every render this function will serve
 * sufficiently but it should not be looked upon
 * as good example code!
 *
 * @param {string} text input list of blocks as HTML string
 * @returns {string} marked-up text
 */
const toBlocks = ( text ) =>
	text.split( '\n' ).reduce(
		( { out, inFence, inList }, raw ) => {
			// detect code fences
			// ```js
			// doFoo()
			// ```

			// code fence?
			// WordPress can replace `` with a fancy double-quote
			if ( /^(```|“`)[a-z1-9]*\s*$/i.test( raw ) ) {
				// opening a fence
				if ( ! inFence ) {
					return {
						out: out + '<pre><code>',
						inFence: true,
						inList,
					};
				}

				// closing a fence
				return {
					out: out + '</code></pre>',
					inFence: false,
					inList,
				};
			}

			// content inside a fence
			if ( inFence ) {
				return {
					out: out + raw + '\n',
					inFence,
					inList,
				};
			}

			// emphasized definition-like text
			// Some value: some description
			// Header: Value
			//
			// Not! This is fun. This: again; isn't emphasized.
			// May detect false positive if colon found in first sentence.
			const defined = /^[\w\s-_]+:/.test( raw )
				? `<strong>${ raw.split( ':' )[ 0 ] }:</strong>${ raw.replace( /^[^:]+:/, '' ) }`
				: raw;

			// inline `code` snippets
			const coded = defined.replace( /`([^`]+)`/, '<code>$1</code>' );

			// detect list items
			//  - one
			//  * two
			//  [bullet] three
			//  [dash] four
			if ( /^\s*[*\-\u2012-\u2015\u2022]\s/.test( coded ) ) {
				return {
					out:
						out +
						( inList ? '' : '<ul class="wpnc__body-list">' ) +
						`<li>${ coded.replace( /^\s*[*\-\u2012-\u2015\u2022]\s/, '' ) }</li>`,
					inFence,
					inList: true,
				};
			}

			// detect todo lists
			//  x Done
			//  o Not done
			//  O Also not done
			// X also done

			if ( /^\s*x\s/i.test( coded ) ) {
				return {
					out:
						out +
						( inList ? '' : '<ul class="wpnc__body-todo">' ) +
						`<li class="wpnc__todo-done">${ coded.replace( /^\s*x\s/i, '' ) }</li>`,
					inFence,
					inList: true,
				};
			}

			if ( /^\s*o\s/i.test( coded ) ) {
				return {
					out:
						out +
						( inList ? '' : '<ul class="wpnc__body-todo">' ) +
						`<li class="wpnc__todo-not-done">${ coded.replace( /^\s*o\s/i, '' ) }</li>`,
					inFence,
					inList: true,
				};
			}

			// Return a basic paragraph
			// anything else…
			return {
				out: out + ( inList ? '</ul>' : '' ) + `<div>${ coded }</div>`,
				inFence,
				inList: false,
			};
		},
		{ out: '', inFence: false, inList: false }
	).out;

export function internalP( html ) {
	return html.split( '\n\n' ).map( ( chunk, i ) => {
		const key = `block-text-${ i }-${ chunk.length }-${ chunk.slice( 0, 3 ) }-${ chunk.slice(
			-3
		) }`;
		const blocks = toBlocks( chunk );

		return (
			<div
				key={ key }
				dangerouslySetInnerHTML={ {
					__html: blocks,
				} }
			/>
		);
	} );
}

export function p( html, className ) {
	if ( undefined === className ) {
		className = 'wpnc__paragraph';
	}
	return html.split( '\n\n' ).map( ( chunk, i ) => {
		const key = `block-text-${ i }-${ chunk.length }-${ chunk.slice( 0, 3 ) }-${ chunk.slice(
			-3
		) }`;
		const blocks = toBlocks( chunk );

		return (
			<div
				className={ className }
				key={ key }
				dangerouslySetInnerHTML={ {
					__html: blocks,
				} }
			/>
		);
	} );
}

export const pSoup = ( items ) => items.map( toHtml ).map( internalP );

export function getSignature( blocks, note ) {
	if ( ! blocks || ! blocks.length ) {
		return [];
	}

	return blocks.map( function ( block ) {
		var type = 'text';
		var id = null;

		if ( 'undefined' !== typeof block.type ) {
			type = block.type;
		}

		if ( note && note.meta && note.meta.ids && note.meta.ids.reply_comment ) {
			if (
				block.ranges &&
				block.ranges.length > 1 &&
				block.ranges[ 1 ].id == note.meta.ids.reply_comment
			) {
				type = 'reply';
				id = block.ranges[ 1 ].id;
			}
		}

		if (
			'undefined' === typeof block.meta ||
			'undefined' === typeof block.meta.ids ||
			Object.keys( block.meta.ids ).length < 1
		) {
			return { type: type, id: id };
		}

		if ( 'undefined' !== typeof block.meta.ids.comment ) {
			type = 'comment';
			id = block.meta.ids.comment;
		} else if ( 'undefined' !== typeof block.meta.ids.post ) {
			type = 'post';
			id = block.meta.ids.post;
		} else if ( 'undefined' !== typeof block.meta.ids.user ) {
			type = 'user';
			id = block.meta.ids.user;
		}

		return { type: type, id: id };
	} );
}

export function formatString() {
	var args = [].slice.apply( arguments );
	var str = args.shift();

	return str.replace( /{(\d+)}/g, function ( match, number ) {
		return typeof args[ number ] != 'undefined' ? args[ number ] : match;
	} );
}

export function zipWithSignature( blocks, note ) {
	var signature = getSignature( blocks, note );

	return blocks.map( function ( block, i ) {
		return {
			block: block,
			signature: signature[ i ],
		};
	} );
}

export const validURL = /^(?:http(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?((?:(?:[-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|blog|[a-z]{2}))|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\w~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?$/i;

export const linkProps = ( note, block ) => {
	const { site: noteSite, comment, post } = get( note, 'meta.ids', {} );
	const { site: blockSite } = get( block, 'meta.ids', {} );

	const site = block ? blockSite : noteSite;

	let type;

	if ( block ) {
		type = 'site';
	} else if ( comment ) {
		type = 'comment';
	} else if ( post ) {
		type = 'post';
	}

	// if someone's home url is not to a wp site (twitter etc)
	if ( type === 'site' && ! site ) {
		return {};
	}

	switch ( type ) {
		case 'site':
		case 'post':
		case 'comment':
			return pickBy( {
				'data-link-type': type,
				'data-site-id': site,
				'data-post-id': post,
				'data-comment-id': comment,
			} );
		default:
			return {};
	}
};
