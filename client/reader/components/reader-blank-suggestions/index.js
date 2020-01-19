/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Style dependencies
 */
import './style.scss';

function BlankSuggestions( props ) {
	return (
		<div className="reader-blank-suggestions">
			{ props.suggestions &&
				props.translate( 'Suggestions: {{suggestions /}}.', {
					components: {
						suggestions: props.suggestions,
					},
				} ) }
			&nbsp;
		</div>
	);
}

export default localize( BlankSuggestions );
