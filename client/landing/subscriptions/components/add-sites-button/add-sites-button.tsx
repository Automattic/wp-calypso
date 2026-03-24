import { Button } from '@wordpress/components';
import { Icon, plus } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

import './styles.scss';

const AddSitesButton = () => {
	const translate = useTranslate();

	const handleClick = () => {
		recordTracksEvent( 'calypso_subscriptions_add_sites_button_click' );
	};

	return (
		<>
			<Button
				variant="primary"
				className="button subscriptions-add-sites__button"
				onClick={ handleClick }
				href="/reader/new"
			>
				<Icon className="subscriptions-add-sites__button-icon" icon={ plus } />
				<span className="subscriptions-add-sites__button-text">
					{ translate( 'New subscription' ) }
				</span>
			</Button>
		</>
	);
};

export default AddSitesButton;
