/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { useTranslate } from 'i18n-calypso';

/**
 * Style dependencies
 */
import './style.scss';

export default function NoResults( { text, image = false } ) {
	const translate = useTranslate();
	if ( text === undefined ) {
		text = translate( 'No results' );
	}
	return (
		<div className="no-results">
			{ image && <img className="no-results__img" src={ image } alt="" /> }
			<span>{ text }</span>
		</div>
	);
}
