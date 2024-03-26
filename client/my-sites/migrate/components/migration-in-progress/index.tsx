import { Card } from '@automattic/components';
import { MigrationStatus } from '@automattic/data-stores';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { type FC, useEffect } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import wpcom from 'calypso/lib/wp';

interface Props {
	sourceSite?: string;
	targetSite: string;
	siteId: string;
	targetSiteId: string;
	onComplete: () => void;
}

export const MigrationInProgress: FC< Props > = ( props ) => {
	const translate = useTranslate();

	const { sourceSite, targetSite, targetSiteId, onComplete } = props;

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
		<Card className="migrate__pane">
			<img
				className="migrate__illustration"
				src="/calypso/images/illustrations/waitTime-plain.svg"
				alt=""
			/>

			<FormattedHeader
				className="migrate__section-header"
				headerText={ translate( 'Migration in progress' ) }
				align="center"
			/>
			<p>
				{ translate(
					"We're moving everything from {{strong}}{{sp}}%(sourceSite)s{{/sp}}{{/strong}} to {{strong}}{{sp}}%(targetSite)s{{/sp}}{{/strong}}.",
					{
						args: {
							sourceSite: sourceSite || translate( 'your source site' ),
							targetSite,
						},
						components: {
							sp: <span className="migrate__domain" />,
							strong: <strong />,
						},
					}
				) }
			</p>
			<p>
				{ translate(
					'You will be inform via email once your site has successfully migrated to its new home.'
				) }
			</p>
			<Spinner />
		</Card>
	);
};
