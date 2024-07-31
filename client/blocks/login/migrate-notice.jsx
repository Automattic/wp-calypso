import { MaterialIcon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { recordTracksEventWithClientId as recordTracksEvent } from 'calypso/state/analytics/actions';

import './migrate-notice.scss';

const MigrateNotice = () => {
	const translate = useTranslate();

	const recordClick = () => {
		recordTracksEvent( 'calypso_login_failed_migrate_notice_cta_click' );
	};

	useEffect( () => {
		recordTracksEvent( 'calypso_login_failed_migrate_notice_show' );
	}, [] );

	return (
		<div className="login__form-migrate-notice">
			<span>
				<MaterialIcon icon="dns" size={ 20 } />

				{ translate(
					'Is your WordPress site hosted elsewhere? {{migrateLink}}Get help moving your site to WordPress.com{{/migrateLink}}!',
					{
						components: {
							migrateLink: <a href="https://wordpress.com/move/" onClick={ recordClick } />,
						},
					}
				) }
			</span>
		</div>
	);
};

export default MigrateNotice;
