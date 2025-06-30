import { Button, CheckboxControl, Icon } from '@wordpress/components';
import { chevronDown, chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import { useCallback, useEffect, useState } from 'react';
import { useFileBrowser } from './context';
import FileInfoCard from './file-info-card';
import FileTypeIcon from './file-type-icon';
import { useBackupContentsQuery } from './hooks';
import { FileBrowserItem, FileBrowserCheckState } from './types';
import { useTruncatedFileName } from './utils';

interface FileBrowserNodeProps {
	item: FileBrowserItem;
	path: string;
	siteId: number;
	rewindId: number;
	isAlternate: boolean;
	parentItem?: FileBrowserItem;
}

const FileBrowserNode = ( {
	item,
	path,
	siteId,
	rewindId,
	isAlternate,
	parentItem,
}: FileBrowserNodeProps ) => {
	const isRoot = path === '/';
	const { state, addChildNodes, setNodeCheckState, setActiveNodePath, getNodeCheckState } =
		useFileBrowser();
	const isCurrentNodeClicked = state.activeNodePath === path;
	const [ fetchContentsOnMount, setFetchContentsOnMount ] = useState< boolean >( isRoot );
	const [ isOpen, setIsOpen ] = useState< boolean >( isRoot );
	const [ addedAnyChildren, setAddedAnyChildren ] = useState< boolean >( false );

	const {
		isSuccess,
		isLoading,
		data: backupFiles,
	} = useBackupContentsQuery( siteId, rewindId, path, fetchContentsOnMount );

	const shouldAddChildNode = useCallback(
		( childItem: FileBrowserItem ) => {
			if ( childItem.type === 'wordpress' ) {
				return false;
			}

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

	const addChildrenWhenLoaded = useCallback(
		( parentPath: string, backupFiles: FileBrowserItem[] ) => {
			if ( backupFiles ) {
				addChildNodes(
					parentPath,
					backupFiles.filter( shouldAddChildNode ).map( ( childItem: FileBrowserItem ) => {
						return {
							id: childItem.id ?? '',
							path: childItem.name,
							type: childItem.type,
							totalItems: childItem.totalItems,
						};
					} )
				);
			}
		},
		[ addChildNodes, shouldAddChildNode ]
	);

	useEffect( () => {
		if ( isSuccess ) {
			if ( item.hasChildren && ! addedAnyChildren ) {
				addChildrenWhenLoaded( path, backupFiles );
				setAddedAnyChildren( true );
			}
		}
	}, [ addChildrenWhenLoaded, addedAnyChildren, backupFiles, isSuccess, item.hasChildren, path ] );

	useEffect( () => {
		if ( ! isCurrentNodeClicked && ! isRoot ) {
			setIsOpen( false );
		}
	}, [ isCurrentNodeClicked, isRoot ] );

	const onCheckboxChange = () => {
		const currentState = getNodeCheckState( path );
		const newState: FileBrowserCheckState = currentState === 'unchecked' ? 'checked' : 'unchecked';
		setNodeCheckState( path, newState );
	};

	const handleClick = useCallback( () => {
		if ( ! isOpen ) {
			setFetchContentsOnMount( true );
		}

		if ( ! item.hasChildren ) {
			if ( ! isOpen ) {
				setActiveNodePath( path );
			} else {
				setActiveNodePath( '' );
			}
		}

		setIsOpen( ! isOpen );
	}, [ isOpen, item, path, setActiveNodePath ] );

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

		if ( isSuccess && addedAnyChildren ) {
			let childIsAlternate = isAlternate;

			return backupFiles.map( ( childItem ) => {
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
						siteId={ siteId }
						rewindId={ rewindId }
						isAlternate={ childIsAlternate }
						{ ...( childItem.type === 'archive' ? { parentItem: item } : {} ) }
					/>
				);
			} );
		}

		return null;
	};

	const renderCheckbox = () => {
		if ( item.type === 'wordpress' ) {
			return null;
		}

		const checkState = getNodeCheckState( path );

		return (
			<CheckboxControl
				__nextHasNoMarginBottom
				checked={ checkState === 'checked' }
				indeterminate={ checkState === 'mixed' }
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
							variant="tertiary"
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
