import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
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

		const source = isEnabled( 'is_running_in_jetpack_site' ) ? 'jetpack' : 'calypso';
		recordTracksEvent( 'jetpack_stats_upsell_clicked', {
			stat_type: statType,
			source,
		} );

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
				<StatsUpsellModal
					onClose={ closeModal }
					onSubmit={ () => {
						closeModal();
						page.redirect(
							`/plans/${ siteSlug }/?feature=stats&plan=personal-bundle&redirect_to=/stats/day/${ siteSlug }`
						);
					} }
				/>
			) }
		</div>
	);
};
export default StatsCardUpsell;
