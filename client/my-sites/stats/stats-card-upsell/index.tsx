import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import './style.scss';

interface Props {
	className: string;
	statType: string;
	siteId: number;
}

const StatsCardUpsell: React.FC< Props > = ( { className, statType, siteId } ) => {
	const translate = useTranslate();

	const onClick = ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => {
		event.preventDefault();

		const source = isEnabled( 'is_running_in_jetpack_site' ) ? 'jetpack' : 'calypso';
		recordTracksEvent( 'jetpack_stats_upsell_clicked', {
			statType,
			source,
		} );

		page( `/stats/purchase/${ siteId }?productType=personal&from=${ source }` );
	};

	return (
		<div className={ classNames( 'stats-card-upsell', className ) }>
			<div className="stats-card-upsell__content">
				<div className="stats-card-upsell__lock">
					<Gridicon icon="lock" />
				</div>
				<div className="stats-card-upsell__text">
					{ translate( 'Upgrade your plan to unlock advanced stats.' ) }
				</div>
				<Button className="stats-card-upsell__button" onClick={ onClick }>
					Unlock
				</Button>
			</div>
		</div>
	);
};
export default StatsCardUpsell;
