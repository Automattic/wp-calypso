import { Button, Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
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

	const onClick = ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => {
		event.preventDefault();
		dispatch( toggleUpsellModal( siteId, STATS_FEATURE_DOWNLOAD_CSV ) );
	};

	return (
		<>
			<Button
				className={ clsx( className, 'stats-download-csv-upsell', 'stats-download-csv' ) }
				compact
				borderless={ borderless }
				onClick={ onClick }
			>
				<Gridicon icon="cloud-download" /> { translate( 'Upgrade & Download to CSV' ) }
			</Button>
		</>
	);
};

export default StatsDownloadCsvUpsell;
