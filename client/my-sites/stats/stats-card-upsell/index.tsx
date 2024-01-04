import { Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { toggleUpsellModal } from 'calypso/state/stats/paid-stats-upsell/actions';
import './style.scss';

interface Props {
	className: string;
	statType: string;
	siteId: number;
}

const StatsCardUpsell: React.FC< Props > = ( { className, statType, siteId } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onClick = ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => {
		event.preventDefault();
		dispatch( toggleUpsellModal( siteId, statType ) );
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
				<Button primary className="stats-card-upsell__button" onClick={ onClick }>
					Unlock
				</Button>
			</div>
		</div>
	);
};
export default StatsCardUpsell;
