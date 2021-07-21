/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

type Props = {
	actionText: string;
	href: string;
	statusText: string;
	titleText: string | undefined;
};

export const BackupStorageSpaceUpsell: FunctionComponent< Props > = ( {
	actionText,
	href,
	statusText,
	titleText,
} ) => (
	<>
		{ titleText && <div className="backup-storage-space-upsell__title-text">{ titleText }</div> }
		<Button className="backup-storage-space-upsell__button" href={ href }>
			<div className="backup-storage-space-upsell__grid">
				<div>
					<div className="backup-storage-space-upsell__status-text">{ statusText }</div>
					<div className="backup-storage-space-upsell__action-text">{ actionText }</div>
				</div>
				<Gridicon icon="arrow-right" />
			</div>
		</Button>
	</>
);
