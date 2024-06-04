import { Button, CheckboxControl, Icon } from '@wordpress/components';
import { useCallback, useState, useEffect } from '@wordpress/element';
import { chevronDown, chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { addChildNodes, setNodeCheckState } from 'calypso/state/rewind/browser/actions';
import getBackupBrowserNode from 'calypso/state/rewind/selectors/get-backup-browser-node';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import FileInfoCard from './file-info-card';
import FileTypeIcon from './file-type-icon';
import { useTruncatedFileName } from './hooks';
import { FileBrowserItem, FileBrowserCheckState } from './types';
import { useBackupContentsQuery } from './use-backup-contents-query';

interface FileBrowserNodeProps {
	item: FileBrowserItem;
	path: string;
	rewindId: number;
	isAlternate: boolean; // This decides if the node will have a background color or not
	setActiveNodePath: ( path: string ) => void;
	activeNodePath: string;
	parentItem?: FileBrowserItem; // This is used to pass the extension details to the child node
}

const FileBrowserNode: FunctionComponent< FileBrowserNodeProps > = ( {
	item,
	path,
	rewindId,
	isAlternate,
	setActiveNodePath,
	activeNodePath,
	parentItem,
} ) => {
	const isRoot = path === '/';
	const dispatch = useDispatch();
	const isCurrentNodeClicked = activeNodePath === path;
	const [ fetchContentsOnMount, setFetchContentsOnMount ] = useState< boolean >( isRoot );
	const [ isOpen, setIsOpen ] = useState< boolean >( isRoot );
	const [ addedAnyChildren, setAddedAnyChildren ] = useState< boolean >( false );
	const siteId = useSelector( getSelectedSiteId ) as number;
	const browserNodeItem = useSelector( ( state ) => getBackupBrowserNode( state, siteId, path ) );

	const {
		isSuccess,
		isInitialLoading,
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

	// When we load the children from the API we'll add their check status info to the state
	const addChildrenWhenLoaded = useCallback(
		( siteId: number, path: string, backupFiles: FileBrowserItem[] ) => {
			if ( backupFiles ) {
				dispatch(
					addChildNodes(
						siteId,
						path,
						backupFiles.filter( shouldAddChildNode ).map( ( childItem: FileBrowserItem ) => {
							return {
								id: childItem.id ?? '',
								path: childItem.name,
								type: childItem.type,
								totalItems: childItem.totalItems,
							};
						} )
					)
				);
			}
		},
		[ dispatch, shouldAddChildNode ]
	);

	// When the checkbox is clicked, we'll update the check state in the state
	const updateNodeCheckState = useCallback(
		( siteId: number, path: string, checkState: FileBrowserCheckState ) => {
			dispatch( setNodeCheckState( siteId, path, checkState ) );
		},
		[ dispatch ]
	);

	// Using isSuccess to track the API call status
	useEffect( () => {
		if ( isSuccess ) {
			if ( item.hasChildren && ! addedAnyChildren ) {
				// Add children to the node
				addChildrenWhenLoaded( siteId, path, backupFiles );
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
	const onCheckboxChange = () => {
		updateNodeCheckState(
			siteId,
			path,
			browserNodeItem && browserNodeItem.checkState === 'unchecked' ? 'checked' : 'unchecked'
		);
	};

	const handleClick = useCallback( () => {
		if ( ! isOpen ) {
			setFetchContentsOnMount( true );

			if ( item.type !== 'dir' ) {
				dispatch(
					recordTracksEvent( 'calypso_jetpack_backup_browser_view_file', {
						file_type: item.type,
					} )
				);
			}
		}

		// If the node doesn't have children, let's open the file info card
		if ( ! item.hasChildren ) {
			if ( ! isOpen ) {
				setActiveNodePath( path );
			} else {
				setActiveNodePath( '' );
			}
		}

		setIsOpen( ! isOpen );
	}, [ dispatch, isOpen, item, path, setActiveNodePath ] );

	const renderChildren = () => {
		if ( isInitialLoading ) {
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

			return backupFiles.map( ( childItem ) => {
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
					<FileBrowserNode
						key={ childItem.name }
						item={ childItem }
						path={ `${ path }${ childItem.name }/` }
						rewindId={ rewindId }
						isAlternate={ childIsAlternate }
						activeNodePath={ activeNodePath }
						setActiveNodePath={ setActiveNodePath }
						// Hacky way to pass extensions details to the child node
						{ ...( childItem.type === 'archive' ? { parentItem: item } : {} ) }
					/>
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
				checked={ browserNodeItem ? browserNodeItem.checkState === 'checked' : false }
				indeterminate={ browserNodeItem && browserNodeItem.checkState === 'mixed' }
				onChange={ onCheckboxChange }
			/>
		);
	};

	const renderExpandIcon = () => {
		if ( ! item.hasChildren ) {
			return null;
		}

		return <Icon icon={ isOpen ? chevronDown : chevronRight } />;
	};

	const nodeItemClassName = clsx( 'file-browser-node__item', {
		'is-alternate': isAlternate,
	} );
	const [ label, isLabelTruncated ] = useTruncatedFileName( item.name, 30, item.type );

	const nodeClassName = clsx( 'file-browser-node', item.type, {
		'is-root': isRoot,
	} );

	return (
		<div className={ nodeClassName }>
			<div className={ nodeItemClassName }>
				{ ! isRoot && (
					<>
						{ renderCheckbox() }
						<Button
							icon={ renderExpandIcon }
							className="file-browser-node__title has-icon"
							onClick={ handleClick }
							showTooltip={ isLabelTruncated }
							label={ item.name }
						>
							<FileTypeIcon type={ item.type } /> { label }
						</Button>
					</>
				) }
			</div>
			{ isCurrentNodeClicked && (
				<FileInfoCard
					siteId={ siteId }
					rewindId={ rewindId }
					item={ item }
					parentItem={ parentItem }
					path={ path }
				/>
			) }
			{ isOpen && (
				<>
					{ item.hasChildren && (
						<div className="file-browser-node__contents">{ renderChildren() }</div>
					) }
				</>
			) }
		</div>
	);
};

export default FileBrowserNode;
