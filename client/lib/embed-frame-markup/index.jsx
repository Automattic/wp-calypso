// Here be dragons...
/* eslint-disable react/no-danger */

/**
 * External dependencies
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { flatMap, map } from 'lodash';

/**
 * Constants
 */
const JQUERY_URL = 'https://s0.wp.com/wp-includes/js/jquery/jquery.js';

export default function generateEmbedFrameMarkup( { body, scripts, styles } = {} ) {
	if ( ! body && ! scripts && ! styles ) {
		return '';
	}

	return renderToStaticMarkup(
		<html>
			<head>
				{ map( styles, ( { media, src }, key ) => (
					<link key={ key } rel="stylesheet" media={ media } href={ src } />
				) ) }
				<style dangerouslySetInnerHTML={ { __html: 'a { cursor: default; }' } } />
			</head>
			<body style={ { margin: 0 } }>
				<div dangerouslySetInnerHTML={ { __html: body } } />
				{ /* Many embed/shortcode scripts assume jQuery is already defined */ }
				<script src={ JQUERY_URL } />
				<script
					dangerouslySetInnerHTML={ {
						__html: `
					[ 'click', 'dragstart' ].forEach( function( type ) {
						document.addEventListener( type, function( event ) {
							event.preventDefault();
							event.stopImmediatePropagation();
						}, true );
					} );
				`,
					} }
				/>
				{ flatMap( scripts, ( { extra, src }, key ) => {
					return [
						extra ? (
							<script
								key={ key + '-extra' }
								dangerouslySetInnerHTML={ {
									__html: extra,
								} }
							/>
						) : null,
						<script key={ key } src={ src } />,
					];
				} ) }
			</body>
		</html>
	);
}
