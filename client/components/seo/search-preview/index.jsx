/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { firstValid, hardTruncation, shortEnough, truncatedAtSpace } from '../helpers';

/**
 * Style dependencies
 */
import './style.scss';

const TITLE_LENGTH = 63;
const SNIPPET_LENGTH = 160;

const googleTitle = firstValid(
	shortEnough( TITLE_LENGTH ),
	truncatedAtSpace( TITLE_LENGTH - 40, TITLE_LENGTH + 10 ),
	hardTruncation( TITLE_LENGTH )
);

const googleSnippet = firstValid(
	shortEnough( SNIPPET_LENGTH ),
	truncatedAtSpace( SNIPPET_LENGTH - 80, SNIPPET_LENGTH + 10 ),
	hardTruncation( SNIPPET_LENGTH )
);

const googleUrl = hardTruncation( 79 );

export default function SearchPreview( { snippet, title, url } ) {
	const translate = useTranslate();

	return (
		<div className="search-preview">
			<h2 className="search-preview__header">{ translate( 'Search Preview' ) }</h2>
			<div className="search-preview__display">
				<div className="search-preview__title">{ googleTitle( title ) }</div>
				<div className="search-preview__url">{ googleUrl( url ) } ▾</div>
				<div className="search-preview__snippet">{ googleSnippet( snippet || '' ) }</div>
			</div>
		</div>
	);
}

SearchPreview.propTypes = {
	title: PropTypes.string,
	url: PropTypes.string,
	snippet: PropTypes.string,
};

SearchPreview.defaultProps = {
	title: '',
	url: '',
	snippet: '',
};
