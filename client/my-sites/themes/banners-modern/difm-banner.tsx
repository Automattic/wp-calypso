import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { preventWidows } from 'calypso/lib/formatting';

import './style.scss';

const DIFMBanner = () => {
	const translate = useTranslate();

	const trackClick = useCallback( () => {
		recordTracksEvent( 'calypso_themeshowcase_difm_banner_click' );
	}, [] );

	return (
		<div className="banner-modern difm-banner">
			<div className="banner-modern__content">
				<h2 className="banner-modern__title">
					{ translate( 'Get a professional website in days' ) }
				</h2>
				<p className="banner-modern__description">
					{ preventWidows(
						translate(
							'Built by WordPress.com experts and fully managed for you\u2014no coding or setup required.'
						)
					) }
				</p>
				<Button
					className="banner-modern__button"
					variant="primary"
					href="https://wordpress.com/website-design-service/"
					onClick={ trackClick }
				>
					{ translate( 'Hire an expert' ) }
				</Button>
			</div>
		</div>
	);
};

export default DIFMBanner;
