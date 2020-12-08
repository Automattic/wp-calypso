/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import {
	firstValid,
	hardTruncation,
	shortEnough,
	truncatedAtSpace,
	stripHtmlTags,
} from '../helpers';

/**
 * Style dependencies
 */
import './style.scss';

const URL_LENGTH = 68;
const TITLE_LENGTH = 63;
const DESCRIPTION_LENGTH = 160;

const googleUrl = ( url ) => {
	const breadcrumb = url
		.replace( /^[^/]+[/]*/, '' )
		.split( '/' )
		.join( ' › ' );

	const truncateBreadcrumb = firstValid( shortEnough( URL_LENGTH ), hardTruncation( URL_LENGTH ) );

	return truncateBreadcrumb( breadcrumb );
};

const googleTitle = firstValid(
	shortEnough( TITLE_LENGTH ),
	truncatedAtSpace( TITLE_LENGTH - 40, TITLE_LENGTH + 10 ),
	hardTruncation( TITLE_LENGTH )
);

const googleDescription = firstValid(
	shortEnough( DESCRIPTION_LENGTH ),
	truncatedAtSpace( DESCRIPTION_LENGTH - 80, DESCRIPTION_LENGTH + 10 ),
	hardTruncation( DESCRIPTION_LENGTH )
);

export default function SearchPreview( { description, title, url } ) {
	return (
		<div className="search-preview">
			<div className="search-preview__display">
				<div className="search-preview__url">{ googleUrl( url ) } ▾</div>
				<div className="search-preview__title">{ googleTitle( title ) }</div>
				<div className="search-preview__description">
					{ googleDescription( stripHtmlTags( description ) ) }
				</div>
			</div>
		</div>
	);
}

SearchPreview.propTypes = {
	title: PropTypes.string,
	url: PropTypes.string,
	description: PropTypes.string,
};

SearchPreview.defaultProps = {
	title: '',
	url: '',
	description: '',
};
