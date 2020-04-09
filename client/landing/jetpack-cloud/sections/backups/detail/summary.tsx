/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';

interface Props {
	thisBackup: object;
}

const BackupDetailSummary: FunctionComponent< Props > = ( { thisBackup } ) => {
	const translate = useTranslate();

	const meta = thisBackup.activityDescription[ 2 ].children[ 0 ];
	const metaList =
		meta &&
		meta.split( ', ' ).map( item => {
			return <li key={ item }>{ item }</li>;
		} );

	return (
		<FoldableCard header={ translate( 'Total # of files backed up' ) }>
			<ul>{ metaList }</ul>
		</FoldableCard>
	);
};

export default BackupDetailSummary;
