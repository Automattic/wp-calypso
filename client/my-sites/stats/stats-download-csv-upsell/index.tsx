import { Button, Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { useSelector } from 'calypso/state';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { toggleUpsellModal } from 'calypso/state/stats/paid-stats-upsell/actions';
import { STATS_FEATURE_DOWNLOAD_CSV } from '../constants';

interface Props {
	className: string;
	siteId: number;
	borderless: boolean;
}

const StatsDownloadCsvUpsell: React.FC< Props > = ( { className, siteId, borderless } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isSiteJetpackNotAtomic = useSelector( ( state ) =>
		isJetpackSite( state, siteId, {
			treatAtomicAsJetpackSite: false,
		} )
	);

	const onClick = ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => {
		event.preventDefault();

		// Stop the popup from showing for Jetpack sites.
		if ( isSiteJetpackNotAtomic ) {
			return;
		}

		dispatch( toggleUpsellModal( siteId, STATS_FEATURE_DOWNLOAD_CSV ) );
	};

	return (
		<>
			<Button
				className={ clsx( className, 'stats-download-csv-upsell', 'stats-download-csv' ) }
				compact
				borderless={ borderless }
				onClick={ onClick }
				disabled={ !! isSiteJetpackNotAtomic }
			>
				<Gridicon icon="cloud-download" /> { translate( 'Upgrade & Download to CSV' ) }
			</Button>
		</>
	);
};

export default StatsDownloadCsvUpsell;
