import {
	Button,
	CheckboxControl,
	Icon,
	Spinner,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useCallback, useState, useEffect } from '@wordpress/element';
import { __, sprintf, isRTL } from '@wordpress/i18n';
import { chevronDown, chevronLeft, chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import { useFileBrowserContext } from './file-browser-context';
import FileInfoCard from './file-info-card';
import FileTypeIcon from './file-type-icon';
import { useTruncatedFileName } from './hooks';
import { FileBrowserItem, FileBrowserCheckState } from './types';
import { useBackupContentsQuery } from './use-backup-contents-query';
import type { FileBrowserConfig } from './index';

interface FileBrowserNodeProps {
	item: FileBrowserItem;
	path: string;
	rewindId: number;
	isAlternate: boolean; // This decides if the node will have a background color or not
	setActiveNodePath: ( path: string ) => void;
	activeNodePath: string;
	parentItem?: FileBrowserItem; // This is used to pass the extension details to the child node
	fileBrowserConfig?: FileBrowserConfig;
	siteId: number;
	siteSlug: string;
	hasCredentials?: boolean;
	isRestoreEnabled?: boolean;
	onTrackEvent?: ( eventName: string, properties?: Record< string, unknown > ) => void;
	onRequestGranularRestore: ( siteSlug: string, rewindId: number ) => void;
}

function FileBrowserNode( {
	item,
	path,
	rewindId,
	isAlternate,
	setActiveNodePath,
	activeNodePath,
	parentItem,
	fileBrowserConfig,
	siteId,
	siteSlug,
	hasCredentials,
	isRestoreEnabled,
	onTrackEvent,
	onRequestGranularRestore,
}: FileBrowserNodeProps ) {
	// Spinner styles for different positions
	const spinnerStyles = {
		left: {
			width: '12px',
			height: '12px',
			margin: 0,
			padding: '0 6px',
		},
		right: {
			width: '12px',
			height: '12px',
			margin: 0,
		},
	};

	const { fileBrowserState } = useFileBrowserContext();
	const isRoot = path === '/';
	const isCurrentNodeClicked = activeNodePath === path;
	const showFileCard = fileBrowserConfig?.showFileCard ?? true;
	const showSeparateExpandButton = fileBrowserConfig?.showSeparateExpandButton ?? false;
	const applyFiltering = !! fileBrowserConfig;
	const [ fetchContentsOnMount, setFetchContentsOnMount ] = useState< boolean >( isRoot );
	const [ isOpen, setIsOpen ] = useState< boolean >( isRoot );
	const [ addedAnyChildren, setAddedAnyChildren ] = useState< boolean >( false );
	const { getNode, addChildNodes, setNodeCheckState } = fileBrowserState;
	const browserNodeItem = getNode( path, rewindId );
	const expandIcon = isRTL() ? chevronLeft : chevronRight;
	const expandDirectoriesOnClick = fileBrowserConfig?.expandDirectoriesOnClick ?? true;

	const {
		isSuccess,
		isLoading,
		data: backupFiles,
	} = useBackupContentsQuery( siteId, rewindId, path, fetchContentsOnMount );

	// We don't want to add changed extensions or original extensions if the extension version is not available
	const shouldAddChildNode = useCallback(
		( childItem: FileBrowserItem ) => {
			// We won't add checkboxes for WordPres since we don't restore it
			if ( childItem.type === 'wordpress' ) {
				return false;
			}

			// Everything else, except archives are fine, they need some extra checking based on changed/unchanged
			if ( childItem.type !== 'archive' ) {
				return true;
			}

			if ( childItem.extensionType === 'changed' ) {
				return false;
			}

			if ( ! item.extensionVersion ) {
				return false;
			}

			return true;
		},
		[ item.extensionVersion ]
	);

	const shouldRestrictChildren = useCallback(
		( childItem: FileBrowserItem ) => {
			if (
				fileBrowserConfig?.restrictedTypes &&
				fileBrowserConfig?.restrictedTypes.includes( childItem.type )
			) {
				return true;
			}
			return false;
		},
		[ fileBrowserConfig?.restrictedTypes ]
	);

	// When we load the children from the API we'll add their check status info to the state
	const addChildrenWhenLoaded = useCallback(
		( path: string, backupFiles: FileBrowserItem[] ) => {
			if ( backupFiles ) {
				addChildNodes( path, backupFiles.filter( shouldAddChildNode ), rewindId );
			}
		},
		[ addChildNodes, rewindId, shouldAddChildNode ]
	);

	// When the checkbox is clicked, we'll update the check state in the state
	const updateNodeCheckState = useCallback(
		( path: string, checkState: FileBrowserCheckState ) => {
			setNodeCheckState( path, checkState, rewindId );
		},
		[ rewindId, setNodeCheckState ]
	);

	// Using isSuccess to track the API call status
	useEffect( () => {
		if ( isSuccess ) {
			if ( item.hasChildren && ! addedAnyChildren ) {
				// Add children to the node
				addChildrenWhenLoaded( path, backupFiles );
				setAddedAnyChildren( true );
			}
		}
	}, [
		addChildrenWhenLoaded,
		addedAnyChildren,
		backupFiles,
		isSuccess,
		item.hasChildren,
		path,
		siteId,
	] );

	useEffect( () => {
		// When it is no longer the current node clicked, close the node
		if ( ! isCurrentNodeClicked && ! isRoot ) {
			setIsOpen( false );
		}
	}, [ isCurrentNodeClicked, isRoot ] );

	// A simple toggle.  Mixed will go to unchecked.
	const onCheckboxChange = useCallback( () => {
		updateNodeCheckState(
			path,
			browserNodeItem && browserNodeItem.checkState === 'unchecked' ? 'checked' : 'unchecked'
		);
	}, [ path, browserNodeItem, updateNodeCheckState ] );

	const handleClick = useCallback( () => {
		if ( ! isOpen ) {
			setFetchContentsOnMount( true );

			if ( item.type !== 'dir' && onTrackEvent ) {
				onTrackEvent( 'calypso_jetpack_backup_browser_view_file', {
					file_type: item.type,
				} );
			}
		}

		if ( ! showFileCard ) {
			onCheckboxChange();
		}

		// If the node doesn't have children, let's open the file info card
		if ( ! item.hasChildren ) {
			if ( ! isOpen ) {
				setActiveNodePath( path );
			} else {
				setActiveNodePath( '' );
			}
		}

		if ( expandDirectoriesOnClick ) {
			setIsOpen( ! isOpen );
		}
	}, [
		expandDirectoriesOnClick,
		isOpen,
		item,
		path,
		setActiveNodePath,
		onCheckboxChange,
		showFileCard,
		onTrackEvent,
	] );

	const handleExpandButtonClick = useCallback( () => {
		if ( ! isOpen ) {
			setFetchContentsOnMount( true );
		}

		setIsOpen( ! isOpen );
	}, [ isOpen ] );

	const filterItems = useCallback(
		( item: FileBrowserItem ) => {
			// No filter is needed
			if ( ! applyFiltering ) {
				return true;
			}

			// Check if this node should always be included
			if ( fileBrowserConfig?.alwaysInclude?.includes( item.name ) ) {
				return true;
			}

			// Check if this node type should always be excluded
			if ( fileBrowserConfig?.excludeTypes?.includes( item.type ) ) {
				return false;
			}

			// Check if we're at root and this item is in restricted paths
			if ( isRoot && fileBrowserConfig?.restrictedPaths?.includes( item.name ) ) {
				return true;
			}

			// Check if current path includes any restricted path
			if (
				fileBrowserConfig?.restrictedPaths &&
				fileBrowserConfig.restrictedPaths.some( ( restrictedPath ) =>
					path.includes( restrictedPath )
				)
			) {
				return true;
			}
			return false;
		},
		[
			applyFiltering,
			fileBrowserConfig?.alwaysInclude,
			fileBrowserConfig?.excludeTypes,
			fileBrowserConfig?.restrictedPaths,
			isRoot,
			path,
		]
	);

	const renderChildren = () => {
		if ( isLoading ) {
			return (
				<>
					<div className="file-browser-node__loading placeholder" />
					<div className="file-browser-node__loading placeholder" />
					<div className="file-browser-node__loading placeholder" />
				</>
			);
		}

		// @TODO: Add a message when the API fails to fetch
		if ( isSuccess && addedAnyChildren ) {
			let childIsAlternate = isAlternate;

			return backupFiles.filter( filterItems ).map( ( childItem ) => {
				// Let's hide archives that don't have an extension version
				// and changed extensions item node
				if (
					( childItem.type === 'archive' && ! item.extensionVersion ) ||
					childItem.extensionType === 'changed'
				) {
					return null;
				}

				childIsAlternate = ! childIsAlternate;

				return (
					<div
						key={ childItem.name }
						style={ isRoot ? { marginInlineStart: 0 } : { marginInlineStart: 26 } }
					>
						<FileBrowserNode
							item={ childItem }
							path={ `${ path }${ childItem.name }/` }
							rewindId={ rewindId }
							isAlternate={ childIsAlternate }
							activeNodePath={ activeNodePath }
							setActiveNodePath={ setActiveNodePath }
							fileBrowserConfig={ fileBrowserConfig }
							siteId={ siteId }
							siteSlug={ siteSlug }
							hasCredentials={ hasCredentials }
							isRestoreEnabled={ isRestoreEnabled }
							onTrackEvent={ onTrackEvent }
							onRequestGranularRestore={ onRequestGranularRestore }
							// Hacky way to pass extensions details to the child node
							{ ...( childItem.type === 'archive' ? { parentItem: item } : {} ) }
						/>
					</div>
				);
			} );
		}

		return null;
	};

	const renderCheckbox = () => {
		// We don't restore WordPress and just download it individually
		if ( item.type === 'wordpress' ) {
			return null;
		}

		return (
			<CheckboxControl
				__nextHasNoMarginBottom
				checked={ browserNodeItem?.checkState === 'checked' }
				indeterminate={ browserNodeItem?.checkState === 'mixed' }
				onChange={ onCheckboxChange }
				// translators: %s is a file or directory name
				aria-label={ sprintf( __( 'Select %s' ), item.name ) }
			/>
		);
	};

	const buttonExpandIcon = () => {
		if ( ! item.hasChildren || shouldRestrictChildren( item ) ) {
			return null;
		}

		if ( isLoading && isOpen ) {
			return <Spinner style={ spinnerStyles.left } />;
		}

		return <Icon icon={ isOpen ? chevronDown : expandIcon } />;
	};

	const expandButton = () => {
		if ( isLoading && isOpen ) {
			return (
				<div
					className="file-browser-node__separate-expand-button"
					style={ { padding: '6px', color: 'inherit' } }
				>
					<Spinner style={ spinnerStyles.right } />
				</div>
			);
		}

		return (
			<Button
				onClick={ handleExpandButtonClick }
				icon={ isOpen ? chevronDown : expandIcon }
				className="file-browser-node__separate-expand-button"
				variant="tertiary"
				// translators: %s is a directory name
				aria-label={ sprintf( __( 'Expand contents of %s' ), item.name ) }
				aria-expanded={ isOpen }
				size="compact"
				style={ { color: 'inherit' } }
			/>
		);
	};

	const nodeItemClassName = clsx( 'file-browser-node__item', {
		'is-alternate': isAlternate,
	} );
	const [ label, isLabelTruncated ] = useTruncatedFileName( item.name, 30, item.type );

	const nodeClassName = clsx( 'file-browser-node', item.type, {
		'is-root': isRoot,
	} );

	const renderSeparateExpandButton =
		showSeparateExpandButton && item.hasChildren && ! shouldRestrictChildren( item );

	return (
		<VStack className={ nodeClassName } spacing={ 0.5 }>
			{ ! isRoot && (
				<HStack className={ nodeItemClassName } justify="flex-start" spacing={ 0 }>
					{ renderCheckbox() }
					<Button
						icon={ renderSeparateExpandButton ? null : buttonExpandIcon }
						className="file-browser-node__title has-text has-icon"
						onClick={ handleClick }
						showTooltip={ isLabelTruncated }
						label={ item.name }
						variant="tertiary"
						tabIndex={ showSeparateExpandButton && ! showFileCard ? -1 : 0 }
						size="compact"
						style={ { color: 'inherit' } }
					>
						<FileTypeIcon type={ item.type } /> { label }
					</Button>
					{ renderSeparateExpandButton && expandButton() }
				</HStack>
			) }
			{ isCurrentNodeClicked && showFileCard && isRestoreEnabled !== undefined && onTrackEvent && (
				<FileInfoCard
					siteId={ siteId }
					rewindId={ rewindId }
					item={ item }
					parentItem={ parentItem }
					path={ path }
					siteSlug={ siteSlug }
					hasCredentials={ hasCredentials }
					isRestoreEnabled={ isRestoreEnabled }
					onTrackEvent={ onTrackEvent }
					onRequestGranularRestore={ onRequestGranularRestore }
				/>
			) }
			{ isOpen && (
				<>
					{ item.hasChildren && ! shouldRestrictChildren( item ) && (
						<VStack className="file-browser-node__contents" spacing={ 1 }>
							{ renderChildren() }
						</VStack>
					) }
				</>
			) }
		</VStack>
	);
}

export default FileBrowserNode;
