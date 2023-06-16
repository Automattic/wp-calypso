import { Button, Icon } from '@wordpress/components';
import { chevronDown, chevronRight } from '@wordpress/icons';
import classNames from 'classnames';
import { FunctionComponent, useCallback, useState } from 'react';
import FileTypeIcon from './file-type-icon';
import { FileBrowserItem } from './types';
import { useBackupContentsQuery } from './use-backup-contents-query';

interface FileBrowserNodeProps {
	item: FileBrowserItem;
	path: string;
	siteId: number;
	rewindId: number;
	isAlternate: boolean; // This decides if the node will have a background color or not
}

const FileBrowserNode: FunctionComponent< FileBrowserNodeProps > = ( {
	item,
	path,
	siteId,
	rewindId,
	isAlternate,
} ) => {
	const isRoot = path === '/';
	const hasChildren = item.hasChildren;
	const [ fetchContentsOnMount, setFetchContentsOnMount ] = useState< boolean >( isRoot );
	const [ isOpen, setIsOpen ] = useState< boolean >( isRoot );

	const {
		isSuccess,
		isInitialLoading,
		data: backupFiles,
	} = useBackupContentsQuery( siteId, rewindId, path, fetchContentsOnMount );

	const handleClick = useCallback( () => {
		if ( ! hasChildren ) {
			return;
		}

		if ( ! isOpen ) {
			setFetchContentsOnMount( true );
			setIsOpen( true );
		}

		setIsOpen( ! isOpen );
	}, [ hasChildren, isOpen ] );

	const renderChildren = () => {
		if ( isInitialLoading ) {
			return <div className="file-browser-node__loading placeholder" />;
		}

		// @TODO: Add a message when the API fails to fetch
		if ( isSuccess ) {
			let childIsAlternate = isAlternate;

			return backupFiles.map( ( item ) => {
				childIsAlternate = ! childIsAlternate;

				return (
					<FileBrowserNode
						key={ item.name }
						item={ item }
						path={ `${ path }${ item.name }/` }
						siteId={ siteId }
						rewindId={ rewindId }
						isAlternate={ childIsAlternate }
					/>
				);
			} );
		}

		return null;
	};

	const renderExpandIcon = () => {
		if ( ! hasChildren ) {
			return null;
		}

		return <Icon icon={ isOpen ? chevronDown : chevronRight } />;
	};

	const nodeClassName = classNames( 'file-browser-node', { 'is-alternate': isAlternate } );

	return (
		<div className={ nodeClassName }>
			{ isRoot ? null : (
				<Button
					icon={ renderExpandIcon }
					className="file-browser-node__title has-icon"
					onClick={ handleClick }
				>
					<FileTypeIcon type={ item.type } /> { item.name }
				</Button>
			) }

			{ isOpen ? <div className="file-browser-node__contents">{ renderChildren() }</div> : null }
		</div>
	);
};

export default FileBrowserNode;
