import {
	__experimentalText as Text,
	__experimentalHStack as HStack,
	ExternalLink,
} from '@wordpress/components';
import { createInterpolateElement, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import FileBrowserHeader from './file-browser-header';
import FileBrowserNode from './file-browser-node';
import { FileBrowserItem } from './types';

export interface FileBrowserConfig {
	restrictedPaths?: string[];
	restrictedTypes?: string[];
	excludeTypes?: string[];
	expandDirectoriesOnClick?: boolean;
	alwaysInclude?: string[];
	showFileCard?: boolean;
	showBackupTime?: boolean;
	showSeparateExpandButton?: boolean;
	siteId?: number;
	showHeader?: boolean;
}

interface FileBrowserProps {
	rewindId: number;
	siteId: number;
	siteSlug: string;
	fileBrowserConfig?: FileBrowserConfig;

	// Optional site data props
	hasCredentials?: boolean;
	isRestoreEnabled?: boolean;
	displayBackupDate?: string;

	// Tracks analytics callback
	onTrackEvent?: ( eventName: string, properties?: Record< string, unknown > ) => void;

	// Granular download action callback
	onRequestGranularDownload?: (
		siteId: number,
		rewindId: number,
		includePaths: string,
		excludePaths: string
	) => void;

	// Granular restore action callback
	onRequestGranularRestore?: ( siteSlug: string, rewindId: number ) => void;
}

function FileBrowser( {
	rewindId,
	fileBrowserConfig,
	siteId,
	siteSlug,
	hasCredentials,
	isRestoreEnabled,
	displayBackupDate,
	onTrackEvent,
	onRequestGranularDownload,
	onRequestGranularRestore = () => {},
}: FileBrowserProps ) {
	// This is the path of the node that is clicked
	const [ activeNodePath, setActiveNodePath ] = useState< string >( '' );

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
			{ ( fileBrowserConfig?.showHeader ?? true ) && (
				<FileBrowserHeader
					rewindId={ rewindId }
					siteId={ siteId }
					siteSlug={ siteSlug }
					hasCredentials={ hasCredentials }
					isRestoreEnabled={ isRestoreEnabled }
					onTrackEvent={ onTrackEvent }
					onRequestGranularDownload={ onRequestGranularDownload }
					onRequestGranularRestore={ onRequestGranularRestore }
				/>
			) }
			{ fileBrowserConfig?.showBackupTime && displayBackupDate && (
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
						<ExternalLink href={ `/backup/${ siteSlug }` } children={ __( 'Create new backup' ) } />
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
				siteId={ siteId }
				siteSlug={ siteSlug }
				hasCredentials={ hasCredentials }
				isRestoreEnabled={ isRestoreEnabled }
				onTrackEvent={ onTrackEvent }
				onRequestGranularRestore={ onRequestGranularRestore }
			/>
		</div>
	);
}

export default FileBrowser;
