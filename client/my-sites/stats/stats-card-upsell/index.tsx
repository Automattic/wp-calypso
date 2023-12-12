import { Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import './style.scss';

interface Props {
	className: string;
}

const StatsCardUpsell: React.FC< Props > = ( { className } ) => {
	const translate = useTranslate();
	return (
		<div className={ classNames( 'stats-card-upsell', className ) }>
			<div className="stats-card-upsell__content">
				<div className="stats-card-upsell__lock">
					<Gridicon icon="lock" />
				</div>
				<div className="stats-card-upsell__subtitle">
					{ translate( 'Upgrade your plan to unlock advanced stats.' ) }
				</div>
				<Button className="stats-card-upsell__button" href="/plans/123456">
					Unlock
				</Button>
			</div>
		</div>
	);
};
export default StatsCardUpsell;
