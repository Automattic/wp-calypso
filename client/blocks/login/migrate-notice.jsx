import { MaterialIcon } from '@automattic/components';

import './migrate-notice.scss';

const MigrateNotice = ( { translate, recordTracksEvent } ) => {
	const recordClick = () => {
		recordTracksEvent( 'calypso_login_failed_migrate_notice_cta_click' );
	};

	recordTracksEvent( 'calypso_login_failed_migrate_notice_show' );

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
