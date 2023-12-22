import { Button, Gridicon } from '@automattic/components';
import { useState } from '@wordpress/element';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { STATS_FEATURE_DOWNLOAD_CSV } from '../constants';
import StatsUpsellModal from '../stats-upsell-modal';

interface Props {
	className: string;
	siteSlug: string;
	borderless: boolean;
}

const StatsDownloadCsvUpsell: React.FC< Props > = ( { className, siteSlug, borderless } ) => {
	const translate = useTranslate();
	const [ isModalOpen, setOpen ] = useState( false );
	const openModal = () => setOpen( true );
	const closeModal = () => setOpen( false );

	const onClick = ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => {
		event.preventDefault();
		openModal();
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
			{ isModalOpen && (
				<StatsUpsellModal
					closeModal={ closeModal }
					statType={ STATS_FEATURE_DOWNLOAD_CSV }
					siteSlug={ siteSlug }
				/>
			) }
		</>
	);
};

export default StatsDownloadCsvUpsell;
