import {
	__experimentalText as Text,
	__experimentalHStack as HStack,
	ExternalLink,
} from '@wordpress/components';
import { createInterpolateElement, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { FunctionComponent } from 'react';
import useGetDisplayDate from 'calypso/components/jetpack/daily-backup-status/use-get-display-date';
import { useFirstMatchingBackupAttempt } from 'calypso/my-sites/backup/hooks';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import FileBrowserHeader from './file-browser-header';
import FileBrowserNode from './file-browser-node';
import { FileBrowserItem } from './types';

export interface FileBrowserConfig {
	restrictedPaths?: string[];
	restrictedTypes?: string[];
	excludeTypes?: string[];
	alwaysInclude?: string[];
	showHeaderButtons?: boolean;
	showFileCard?: boolean;
	showBackupTime?: boolean;
	siteId?: number;
}

interface FileBrowserProps {
	rewindId: number;
	fileBrowserConfig?: FileBrowserConfig;
	siteId?: number;
}

const FileBrowser: FunctionComponent< FileBrowserProps > = ( {
	rewindId,
	fileBrowserConfig,
	siteId,
} ) => {
	// This is the path of the node that is clicked
	const [ activeNodePath, setActiveNodePath ] = useState< string >( '' );
	const selectedSiteId = useSelector( getSelectedSiteId ) as number;
	const effectiveSiteId = siteId ?? selectedSiteId;

	const effectiveSiteSlug = useSelector( ( state ) => getSiteSlug( state, effectiveSiteId ) ) || '';
	const getDisplayDate = useGetDisplayDate( effectiveSiteId );

	const { backupAttempt: lastKnownBackupAttempt } = useFirstMatchingBackupAttempt(
		effectiveSiteId,
		{
			sortOrder: 'desc',
			successOnly: true,
		}
	);

	const displayBackupDate = lastKnownBackupAttempt
		? getDisplayDate( lastKnownBackupAttempt.activityTs, false )
		: null;

	const handleClick = ( path: string ) => {
		setActiveNodePath( path );
	};

	const rootItem: FileBrowserItem = {
		name: '/',
		hasChildren: true,
		type: 'dir',
	};

	return (
		<div>
			<FileBrowserHeader
				rewindId={ rewindId }
				showHeaderButtons={ fileBrowserConfig?.showHeaderButtons ?? true }
				siteId={ effectiveSiteId }
			/>
			{ fileBrowserConfig?.showBackupTime && (
				<HStack alignment="left" spacing={ 1 }>
					<Text
						color="var(--studio-gray-40)"
						style={ { marginInlineStart: '14px', marginTop: '10px' } }
					>
						{ displayBackupDate
							? createInterpolateElement( __( 'Content from the latest backup: <date />.' ), {
									date: <span>{ displayBackupDate }</span>,
							  } )
							: __( 'There are no backups.' ) }{ ' ' }
						<ExternalLink
							href={ `/backup/${ effectiveSiteSlug }` }
							children={ __( 'Create new backup' ) }
						/>
					</Text>
				</HStack>
			) }
			<FileBrowserNode
				rewindId={ rewindId }
				item={ rootItem }
				path="/"
				isAlternate
				setActiveNodePath={ handleClick }
				activeNodePath={ activeNodePath }
				fileBrowserConfig={ fileBrowserConfig }
				siteId={ effectiveSiteId }
			/>
		</div>
	);
};

export default FileBrowser;
