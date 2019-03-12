/**
 * External dependencies
 */
import { filter, flatMap, head } from 'lodash';

const SUPPORTED_FILE_TYPES_BY_ENGINE = {
	wordpress: [ 'text/xml', 'application/zip' ],
	squarespace: [ 'text/xml' ],
};

export const supportedEnginesForMimeType = mimeType =>
	filter(
		flatMap( SUPPORTED_FILE_TYPES_BY_ENGINE, ( types, engine ) =>
			types.includes( mimeType ) ? engine : false
		)
	);

export const parseFileType = file => {
	const { type } = file;
	const { 1: group, 2: subType } = type.match( /([^\/]+)\/(.*)/ );
	return {
		group,
		subType,
	};
};

export const getRecommendedExperience = ( file, selectedEngine ) => {
	const { type: mimeType } = file;
	const supportedEngines = supportedEnginesForMimeType( mimeType );

	if ( supportedEngines.length ) {
		const engine = supportedEngines.includes( selectedEngine )
			? selectedEngine
			: head( supportedEngines );
		return {
			ui: 'calypso-importer',
			engine,
		};
	}

	const { group } = parseFileType( file );

	if ( [ 'image', 'video' ].includes( group ) ) {
		return {
			ui: 'calypso-medialib',
			type: group,
		};
	}

	/** @TODO pdfs & stuff...
	if ( 'application' === group ) {
		switch ( subType ) {
			case 'pdf':
				return 'media';
			case 'fdafdas':
				return 'xx';
		}
	}
	 */
	return {
		ui: 'calypso-fallback',
	};
};
