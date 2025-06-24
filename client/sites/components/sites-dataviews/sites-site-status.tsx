import { useSiteLaunchStatusLabel } from '@automattic/sites';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { getMigrationStatus } from 'calypso/data/site-migration';
import { SiteLaunchNag } from 'calypso/sites-dashboard/components/sites-site-launch-nag';
import TransferNoticeWrapper from 'calypso/sites-dashboard/components/sites-transfer-notice-wrapper';
import { WithAtomicTransfer } from 'calypso/sites-dashboard/components/with-atomic-transfer';
import { MEDIA_QUERIES } from 'calypso/sites-dashboard/utils';
import { useSelector } from 'calypso/state';
import isDIFMLiteInProgress from 'calypso/state/selectors/is-difm-lite-in-progress';
import type { SiteExcerptData } from '@automattic/sites';

const BadgeDIFM = styled.span`
	color: var( --studio-gray-100 );
	white-space: break-spaces;
`;

const DeletedStatus = styled.div`
	display: inline-flex;
	flex-direction: column;
	align-items: center;
	span {
		color: var( --color-error );
	}
	button {
		padding: 4px;
	}
	${ MEDIA_QUERIES.small } {
		span {
			display: none;
		}
	}
`;

const MigrationInProgressStatus = styled.span`
	display: inline-block;
	padding: 0px 10px;
	font-size: 12px;
	border-radius: 4px;
	background-color: var( --color-primary-0 );
	line-height: 20px;
	font-weight: 500;
	color: var( --color-primary-90 );
`;

const MigrationStatusElement = ( {
	status,
	children,
}: {
	status: string | null;
	children: React.ReactNode;
} ) => {
	switch ( status ) {
		case 'pending':
		case 'started':
			return <MigrationInProgressStatus>{ children }</MigrationInProgressStatus>;
	}

	return children;
};

interface SiteStatusProps {
	site: SiteExcerptData;
}

export const SiteStatus = ( { site }: SiteStatusProps ) => {
	const { __ } = useI18n();

	const translatedStatus = useSiteLaunchStatusLabel( site );
	const migrationStatus = getMigrationStatus( site );
	const isPending = migrationStatus === 'pending';
	const isStarted = migrationStatus === 'started';

	const isDIFMInProgress = useSelector( ( state ) => isDIFMLiteInProgress( state, site.ID ) );

	if ( site.is_deleted ) {
		return (
			<DeletedStatus>
				<span>{ __( 'Deleted' ) }</span>
			</DeletedStatus>
		);
	}

	return (
		<WithAtomicTransfer site={ site }>
			{ ( result ) =>
				result.wasTransferring ? (
					<TransferNoticeWrapper { ...result } />
				) : (
					<>
						{ /* Hide status/checklist during DIFM for cleaner UI, as the user cannot access their site */ }
						{ isDIFMInProgress ? (
							<BadgeDIFM className="site__badge">{ __( 'Express Service' ) }</BadgeDIFM>
						) : (
							<div>
								<MigrationStatusElement status={ migrationStatus }>
									{ translatedStatus }
								</MigrationStatusElement>
								{ ! isPending && ! isStarted && <SiteLaunchNag site={ site } /> }
							</div>
						) }
					</>
				)
			}
		</WithAtomicTransfer>
	);
};
