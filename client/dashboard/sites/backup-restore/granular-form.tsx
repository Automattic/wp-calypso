import { siteBackupGranularRestoreMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { rotateLeft, chevronDown, chevronRight } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { useFileBrowserContext } from '../../../my-sites/backup/backup-contents-page/file-browser/file-browser-context';
import { siteBackupRestoreRoute } from '../../app/router/sites';
import { ButtonStack } from '../../components/button-stack';
import Notice from '../../components/notice';
import { Text } from '../../components/text';

function SiteBackupGranularRestoreForm( {
	siteId,
	onRestoreInitiate,
}: {
	siteId: number;
	onRestoreInitiate: ( restoreId: number ) => void;
} ) {
	const { rewindId } = siteBackupRestoreRoute.useParams();
	const { mutate: restoreMutation, isPending: isRestoreMutationPending } = useMutation(
		siteBackupGranularRestoreMutation( siteId )
	);
	const { createErrorNotice } = useDispatch( noticesStore );

	const { fileBrowserState } = useFileBrowserContext();
	const browserCheckList = fileBrowserState.getCheckList();
	const browserSelectedList = fileBrowserState.getSelectedList();

	// File types supported for custom categorization
	type SectionType = 'file' | 'theme' | 'plugin' | 'table';

	// State for expanding/collapsing sections - only use the relevant types for categorization
	const [ expandedSections, setExpandedSections ] = useState< Record< SectionType, boolean > >( {
		file: true,
		theme: true,
		plugin: true,
		table: true,
	} );

	const handleGranularRestore = () => {
		const includePaths = browserCheckList.includeList.map( ( item ) => item.id ).join( ',' );
		const excludePaths = browserCheckList.excludeList.map( ( item ) => item.id ).join( ',' );

		restoreMutation(
			{
				timestamp: rewindId,
				config: {
					includePaths,
					excludePaths,
				},
			},
			{
				onSuccess: ( restoreId ) => {
					onRestoreInitiate( restoreId );
				},
				onError: () => {
					createErrorNotice( __( 'Failed to initiate restore. Please try again.' ), {
						type: 'snackbar',
					} );
				},
			}
		);
	};

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		handleGranularRestore();
	};

	const toggleSection = ( type: SectionType ) => {
		setExpandedSections( ( prev ) => ( {
			...prev,
			[ type ]: ! prev[ type ],
		} ) );
	};

	const getTypeLabel = ( type: SectionType, allSelected: boolean ) => {
		switch ( type ) {
			case 'file':
				return __( 'Files and directories that will be restored' );
			case 'theme':
				return allSelected ? __( 'All site themes will be restored' ) : __( 'WordPress Themes' );
			case 'plugin':
				return allSelected ? __( 'All site plugins will be restored' ) : __( 'WordPress Plugins' );
			case 'table':
				return allSelected
					? __( 'All site database tables will be restored' )
					: __( 'Site Databases' );
		}
	};

	const renderSection = ( type: SectionType ) => {
		// Filter items by type, excluding directories for other types when showing files
		const items = browserSelectedList.filter( ( item ) => {
			return (
				item.type === type &&
				! [ '/sql', '/wp-content/plugins', '/wp-content/themes' ].includes( item.path )
			);
		} );

		if ( items.length === 0 ) {
			if ( type === 'file' ) {
				return null;
			}
			// Check if all items of this type are selected
			let allItemsSelectedPath = '';
			switch ( type ) {
				case 'theme':
					allItemsSelectedPath = '/wp-content/themes';
					break;
				case 'plugin':
					allItemsSelectedPath = '/wp-content/plugins';
					break;
				case 'table':
					allItemsSelectedPath = '/sql';
					break;
			}
			if (
				browserSelectedList.some( ( item ) => {
					if ( item.path === allItemsSelectedPath || item.path === '/' ) {
						return true;
					}
					// Plugins and themes will all be included if wp-content is selected
					if ( 'table' !== type ) {
						return item.path === '/wp-content';
					}
					return false;
				} )
			) {
				return (
					<Text key={ type } weight={ 500 }>
						{ getTypeLabel( type, true ) }
					</Text>
				);
			}
			return null;
		}

		const fileDisplayLimit = 10;
		const displayItems = items.slice( 0, fileDisplayLimit );
		const remainingCount = items.length - fileDisplayLimit;
		const isExpanded = expandedSections[ type ];
		return (
			<div key={ type }>
				<Button
					variant="link"
					onClick={ () => toggleSection( type ) }
					icon={ isExpanded ? chevronDown : chevronRight }
					iconPosition="right"
				>
					<Text weight={ 500 }>{ getTypeLabel( type, false ) }</Text>
				</Button>
				{ isExpanded && (
					<VStack>
						<ul style={ { margin: 0, paddingInlineStart: '18px' } }>
							{ displayItems.map( ( item ) => (
								<li key={ item.path }>{ item.path }</li>
							) ) }
						</ul>
						{ remainingCount > 0 && (
							<Text>
								{ sprintf(
									/* translators: %d is the number of additional files */
									__( 'and %d more files' ),
									remainingCount
								) }
							</Text>
						) }
					</VStack>
				) }
			</div>
		);
	};

	const hasSelectedTables = browserSelectedList.some(
		( item ) =>
			item.type === 'table' ||
			// Also check if root path or /sql is selected as this includes all tables
			item.path === '/sql' ||
			item.path === '/'
	);

	const restoreWarning = hasSelectedTables
		? __(
				'This action will replace all settings, posts, pages and other site content with the information from the selected restore point.'
		  )
		: __(
				'This action will replace the selected content with the content from the selected restore point.'
		  );

	return (
		<form onSubmit={ handleSubmit }>
			<VStack spacing={ 4 }>
				{ renderSection( 'theme' ) }
				{ renderSection( 'plugin' ) }
				{ renderSection( 'table' ) }
				{ renderSection( 'file' ) }

				<Notice variant="info" title={ __( 'Important' ) }>
					{ restoreWarning }
				</Notice>

				<ButtonStack justify="flex-start">
					<Button
						variant="primary"
						icon={ rotateLeft }
						type="submit"
						isBusy={ isRestoreMutationPending }
						disabled={ isRestoreMutationPending }
					>
						{ __( 'Restore selected files' ) }
					</Button>
				</ButtonStack>
			</VStack>
		</form>
	);
}

export default SiteBackupGranularRestoreForm;
