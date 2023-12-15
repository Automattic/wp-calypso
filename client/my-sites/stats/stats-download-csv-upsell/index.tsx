import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';

interface Props {
	className: string;
	statType: string;
	siteId: number;
	borderless: boolean;
}

const StatsDownloadCsvUpsell: React.FC< Props > = ( {
	className,
	statType,
	siteId,
	borderless,
} ) => {
	const translate = useTranslate();

	const onClick = ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => {
		event.preventDefault();

		const source = isEnabled( 'is_running_in_jetpack_site' ) ? 'jetpack' : 'calypso';
		recordTracksEvent( 'jetpack_stats_csv_upsell_clicked', {
			statType,
			source,
		} );

		page( `/stats/purchase/${ siteId }?productType=personal&from=${ source }` );
	};

	return (
		<Button
			className={ classNames( className, 'stats-download-csv-upsell', 'stats-download-csv' ) }
			compact
			borderless={ borderless }
			onClick={ onClick }
		>
			<Gridicon icon="cloud-download" /> { translate( 'Upgrade & Download to CSV' ) }
		</Button>
	);
};

export default StatsDownloadCsvUpsell;
