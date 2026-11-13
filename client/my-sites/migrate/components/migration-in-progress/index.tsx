import { MigrationStatus } from '@automattic/data-stores';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { type FC, useEffect } from 'react';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import wpcom from 'calypso/lib/wp';
import './style.scss';

interface Props {
	targetSiteId: number;
	onComplete: () => void;
}

export const MigrationInProgress: FC< Props > = ( props ) => {
	const translate = useTranslate();

	const { targetSiteId, onComplete } = props;

	const {
		data: { status },
	} = useQuery( {
		queryKey: [ 'migrationStatus', targetSiteId ],
		initialData: { status: null },
		queryFn: () =>
			wpcom.req.get( {
				path: `/sites/${ targetSiteId }/migration-status`,
				apiNamespace: 'wpcom/v2',
			} ),
		refetchInterval: 5000, // 5 seconds
	} );

	useEffect( () => {
		if ( status === MigrationStatus.DONE || status === MigrationStatus.INACTIVE ) {
			onComplete();
		}
	}, [ onComplete, status ] );
	//

	return (
		<div className="migration-in-progress">
			<h2 className="migration-in-progress__title">
				{ translate( 'We are migrating your site' ) }
			</h2>
			<p>
				{ translate(
					'Feel free to close this window. We’ll email you when your new site is ready.'
				) }
			</p>
			<LoadingEllipsis className="migration-in-progress__loading" />
		</div>
	);
};
