import { useTranslate } from 'i18n-calypso';
import DotPager from 'calypso/components/dot-pager';

import './style.scss';

type BackupTipsProps = {
	location: 'IN_PROGRESS' | 'SCHEDULED' | 'COMPLETED' | 'NO_BACKUPS';
};

// locations where the message about the initial backup should be shown
const LOCATIONS_4_INITIAL_BACKUP_TIP: Array< BackupTipsProps[ 'location' ] > = [
	'IN_PROGRESS',
	'COMPLETED',
];

const BackupTips: React.FC< BackupTipsProps > = ( { location } ) => {
	const translate = useTranslate();

	return (
		<div className="backup-tips__wrapper">
			<DotPager>
				{
					// Tip about initial backup should be shown only at the given locations
					LOCATIONS_4_INITIAL_BACKUP_TIP.includes( location ) && (
						<div>
							<div>
								<b>{ translate( 'Did you know' ) }</b>
							</div>
							{ translate(
								'The initial backup time depends on the size of your site and the stability of the connection. Subsequent backups are usually faster! {{link}}Learn more{{/link}}',
								{
									components: {
										link: (
											<a
												href="https://jetpack.com/support/backup/"
												target="_blank"
												rel="noopener noreferrer"
											/>
										),
									},
								}
							) }
						</div>
					)
				}
				<div>
					<div>
						<b>{ translate( 'Did you know' ) }</b>
					</div>
					{ translate(
						`If there are issues with your backup, we will automatically try again. You'll also get an email if something goes wrong.`
					) }
				</div>
			</DotPager>
		</div>
	);
};

export default BackupTips;
