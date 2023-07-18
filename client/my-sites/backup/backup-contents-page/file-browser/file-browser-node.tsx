import { Button, Icon } from '@wordpress/components';
import { chevronDown, chevronRight } from '@wordpress/icons';
import classNames from 'classnames';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import FileInfoCard from './file-info-card';
import FileTypeIcon from './file-type-icon';
import { useTruncatedFileName } from './hooks';
import { FileBrowserItem } from './types';
import { useBackupContentsQuery } from './use-backup-contents-query';

interface FileBrowserNodeProps {
	item: FileBrowserItem;
	path: string;
	siteId: number;
	rewindId: number;
	isAlternate: boolean; // This decides if the node will have a background color or not
	setActiveNodePath: ( path: string ) => void;
	activeNodePath: string;
	parentItem?: FileBrowserItem; // This is used to pass the extension details to the child node
}

const FileBrowserNode: FunctionComponent< FileBrowserNodeProps > = ( {
	item,
	path,
	siteId,
	rewindId,
	isAlternate,
	setActiveNodePath,
	activeNodePath,
	parentItem,
} ) => {
	const isRoot = path === '/';
	const isCurrentNodeClicked = activeNodePath === path;
	const [ fetchContentsOnMount, setFetchContentsOnMount ] = useState< boolean >( isRoot );
	const [ isOpen, setIsOpen ] = useState< boolean >( isRoot );

	const {
		isSuccess,
		isInitialLoading,
		data: backupFiles,
	} = useBackupContentsQuery( siteId, rewindId, path, fetchContentsOnMount );

	useEffect( () => {
		// When it is no longer the current node clicked, close the node
		if ( ! isCurrentNodeClicked && ! isRoot ) {
			setIsOpen( false );
		}
	}, [ isCurrentNodeClicked, isRoot ] );

	const handleClick = useCallback( () => {
		if ( ! isOpen ) {
			setFetchContentsOnMount( true );
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
	}, [ isOpen, item, path, setActiveNodePath ] );

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
		if ( isSuccess ) {
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
						siteId={ siteId }
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

	const renderExpandIcon = () => {
		if ( ! item.hasChildren ) {
			return null;
		}

		return <Icon icon={ isOpen ? chevronDown : chevronRight } />;
	};

	const nodeItemClassName = classNames( 'file-browser-node__item', {
		'is-alternate': isAlternate,
	} );
	const [ label, isLabelTruncated ] = useTruncatedFileName( item.name, 30, item.type );

	const nodeClassName = classNames( 'file-browser-node', item.type, {
		'is-root': isRoot,
	} );

	return (
		<div className={ nodeClassName }>
			<div className={ nodeItemClassName }>
				{ ! isRoot && (
					<Button
						icon={ renderExpandIcon }
						className="file-browser-node__title has-icon"
						onClick={ handleClick }
						showTooltip={ isLabelTruncated }
						label={ item.name }
					>
						<FileTypeIcon type={ item.type } /> { label }
					</Button>
				) }
			</div>
			{ isCurrentNodeClicked && (
				<FileInfoCard
					siteId={ siteId }
					rewindId={ rewindId }
					item={ item }
					parentItem={ parentItem }
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
