import { SiteExcerptData, useSiteLaunchStatusLabel } from '@automattic/sites';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import * as React from 'react';
import { SiteLaunchNag } from 'calypso/sites-dashboard/components/sites-site-launch-nag';
import TransferNoticeWrapper from 'calypso/sites-dashboard/components/sites-transfer-notice-wrapper';
import { WithAtomicTransfer } from 'calypso/sites-dashboard/components/with-atomic-transfer';
import { useSelector } from 'calypso/state';
import isDIFMLiteInProgress from 'calypso/state/selectors/is-difm-lite-in-progress';

type Props = {
	site: SiteExcerptData;
};

const BadgeDIFM = styled.span`
	color: var( --studio-gray-100 );
	white-space: break-spaces;
`;

export default function SiteTypeColumn( { site }: Props ) {
	const isDIFMInProgress = useSelector( ( state ) => isDIFMLiteInProgress( state, site.ID ) );
	const translatedStatus = useSiteLaunchStatusLabel( site );
	const { __ } = useI18n();
	return (
		<span className="sites-overview__row-status">
			<WithAtomicTransfer site={ site }>
				{ ( result ) =>
					result.wasTransferring ? (
						<TransferNoticeWrapper { ...result } />
					) : (
						<>
							<div>
								{ translatedStatus }
								<SiteLaunchNag site={ site } />
							</div>
							{ isDIFMInProgress && (
								<BadgeDIFM className="site__badge">{ __( 'Express Service' ) }</BadgeDIFM>
							) }
						</>
					)
				}
			</WithAtomicTransfer>
		</span>
	);
}
