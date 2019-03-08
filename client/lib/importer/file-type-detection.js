const SUPPORTED_FILE_TYPES_BY_ENGINE = {
	wordpress: [ 'text/xml', 'application/zip' ],
};

export const parseFileType = file => {
	const { type } = file;
	const { 1: group, 2: subType } = type.match( /([^\/]+)\/(.*)/ );
	return {
		group,
		subType,
	};
};

export const isSupportedFileType = ( sourceType, type ) => {
	const lcSourceType = sourceType.toLowerCase();
	return (
		SUPPORTED_FILE_TYPES_BY_ENGINE[ lcSourceType ] &&
		SUPPORTED_FILE_TYPES_BY_ENGINE[ lcSourceType ].includes( type )
	);
};
