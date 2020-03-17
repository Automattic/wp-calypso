/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

interface Props {
	onConfirm: () => void;
	siteTitle: string | null;
	restoreTimestamp: string;
}

const BackupRestoreConfirm = ( { onConfirm, restoreTimestamp }: Props ) => {
	const translate = useTranslate();

	return (
		<div>
			<h3>{ translate( 'Restore site' ) }</h3>
			<p>
				{ translate(
					'{{strong}}%(restoreTimestamp)s{{/strong}} is the selected point for your restore',
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
			<Button primary onClick={ onConfirm }>
				{ 'Confirm Restore' }
			</Button>
		</div>
	);
};

export default BackupRestoreConfirm;
