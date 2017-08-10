/** @format */
// Here be dragons...
/* eslint-disable react/no-danger */

/**
 * External dependencies
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import createFragment from 'react-addons-create-fragment';
import { mapValues } from 'lodash';

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
				{ createFragment(
					mapValues( styles, style => {
						return <link rel="stylesheet" media={ style.media } href={ style.src } />;
					} )
				) }
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
				{ createFragment(
					mapValues( scripts, script => {
						let extra;
						if ( script.extra ) {
							extra = (
								<script
									dangerouslySetInnerHTML={ {
										__html: script.extra,
									} }
								/>
							);
						}

						return createFragment( {
							extra: extra,
							script: <script src={ script.src } />,
						} );
					} )
				) }
			</body>
		</html>
	);
}
