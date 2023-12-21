import { Button, Gridicon } from '@automattic/components';
import { useState } from '@wordpress/element';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import StatsUpsellModal from '../stats-upsell-modal';
import './style.scss';

interface Props {
	className: string;
	statType: string;
	siteSlug: string;
}

const StatsCardUpsell: React.FC< Props > = ( { className, statType, siteSlug } ) => {
	const translate = useTranslate();
	const [ isModalOpen, setOpen ] = useState( false );
	const openModal = () => setOpen( true );
	const closeModal = () => setOpen( false );

	const onClick = ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => {
		event.preventDefault();
		openModal();
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
			{ isModalOpen && (
				<StatsUpsellModal closeModal={ closeModal } statType={ statType } siteSlug={ siteSlug } />
			) }
		</div>
	);
};
export default StatsCardUpsell;
