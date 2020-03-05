/**
 * External dependencies
 */
import React from 'react';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

interface Props {
	onConfirm: () => void;
	downloadId: string;
	siteId: number | null;
}

const BackupDownloadConfirm = ( { downloadId, siteId, onConfirm }: Props ) => (
	<div>
		<h3>{ 'Create downloadable backup' }</h3>
		<p>
			<strong>{ moment.unix( parseInt( downloadId ) ).format( 'LLL' ) }</strong>
			{ ` is the selected point to create  a download backup of ${ siteId }.` }
		</p>
		<Button onClick={ onConfirm }>{ 'Create downloadable backup' }</Button>
	</div>
);

export default BackupDownloadConfirm;
