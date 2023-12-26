import { Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { toggleUpsellModal } from 'calypso/state/stats/paid-stats-upsell/actions';
import { STATS_FEATURE_DOWNLOAD_CSV } from '../constants';

interface Props {
	className: string;
	siteSlug: string;
	borderless: boolean;
}

const StatsDownloadCsvUpsell: React.FC< Props > = ( { className, siteSlug, borderless } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onClick = ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => {
		event.preventDefault();
		dispatch( toggleUpsellModal( siteSlug, STATS_FEATURE_DOWNLOAD_CSV ) );
	};

	return (
		<>
			<Button
				className={ classNames( className, 'stats-download-csv-upsell', 'stats-download-csv' ) }
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
