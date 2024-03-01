import { Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';

interface Props {
	className: string;
	copyText: string;
	onClick: ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => void;
	buttonLabel?: string;
}

const StatsCardUpsell: React.FC< Props > = ( { className, onClick, copyText, buttonLabel } ) => {
	const translate = useTranslate();

	return (
		<div className={ classNames( 'stats-card-upsell', className ) }>
			<div className="stats-card-upsell__content">
				<div className="stats-card-upsell__lock">
					<Gridicon icon="lock" />
				</div>
				<p className="stats-card-upsell__text">{ copyText }</p>
				<Button primary className="stats-card-upsell__button" onClick={ onClick }>
					{ buttonLabel || translate( 'Unlock' ) }
				</Button>
			</div>
		</div>
	);
};

export default StatsCardUpsell;
