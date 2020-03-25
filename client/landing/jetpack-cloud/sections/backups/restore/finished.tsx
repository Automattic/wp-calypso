/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

interface Props {
	restoreTimestamp: string;
	siteUrl: string | null;
}

const BackupRestoreFinished: FunctionComponent< Props > = ( { restoreTimestamp, siteUrl } ) => {
	const translate = useTranslate();

	return (
		<div>
			<h3 className="restore__title">
				{ translate( 'Your site has been successfully restored.' ) }
			</h3>
			<p className="restore__info">
				{ translate(
					'All of your selected files are now restored back to {{strong}}%(restoreTimestamp)s{{/strong}}',
					{
						args: {
							restoreTimestamp,
						},
						components: {
							strong: <strong />,
						},
					}
				) }
			</p>
			<Button className="restore__primary-button" href={ siteUrl } primary target="_blank">
				{ translate( 'View your website' ) }
			</Button>
		</div>
	);
};

export default BackupRestoreFinished;
