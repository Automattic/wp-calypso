import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { Backup } from '../../types';

export const extractBackupTextValues = ( str: string ): { [ key: string ]: number } => {
	const regex = /(\d+)\s+(\w+)(s)?\b/g;

	let match;
	const result: { [ key: string ]: number } = {};

	while ( ( match = regex.exec( str ) ) !== null ) {
		const key = match[ 2 ].replace( /s$/, '' ); // remove "s" from the end of the key if present since we store plural(pages and posts) as singular(page and post)
		result[ key ] = parseInt( match[ 1 ], 10 );
	}

	return result;
};

const useExtractedBackupTitle = ( backup: Backup | null ) => {
	const translate = useTranslate();

	return useMemo( () => {
		const backupText = backup?.activityDescription?.[ 0 ]?.children?.[ 0 ]?.text;

		if ( ! backupText ) {
			return backup?.activityTitle;
		}

		const { post: postCount, page: pageCount } = extractBackupTextValues( backupText );

		let backupTitle;

		if ( postCount ) {
			backupTitle = translate( '%(posts)d post', '%(posts)d posts', {
				args: { posts: postCount },
				comment: '%(posts) is the no of posts"',
				count: postCount,
			} );
		}

		if ( pageCount ) {
			const pageCountText = translate( '%(pages)d page', '%(pages)d pages', {
				args: { pages: pageCount },
				comment: '%(pages) is the no of pages"',
				count: pageCount,
			} );
			backupTitle = backupTitle ? `${ backupTitle }, ${ pageCountText }` : pageCountText;
		}

		return backupTitle;
	}, [ backup?.activityDescription, backup?.activityTitle, translate ] );
};

export default useExtractedBackupTitle;
