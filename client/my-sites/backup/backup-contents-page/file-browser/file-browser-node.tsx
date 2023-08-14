import { Button, Icon } from '@wordpress/components';
import { useCallback, useEffect, useState } from '@wordpress/element';
import { chevronDown, chevronRight } from '@wordpress/icons';
import classNames from 'classnames';
import { FunctionComponent } from 'react';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FileInfoCard from './file-info-card';
import FileTypeIcon from './file-type-icon';
import { useTruncatedFileName } from './hooks';
import { FileBrowserItem } from './types';
import { useBackupContentsQuery } from './use-backup-contents-query';

interface FileBrowserNodeCheckNode {
	id: string;
	status: 'checked' | 'unchecked' | 'mixed';
	children: FileBrowserNodeCheckNode[];
}

interface FileBrowserNodeProps {
	item: FileBrowserItem;
	path: string;
	siteId: number;
	rewindId: number;
	isAlternate: boolean; // This decides if the node will have a background color or not
	setActiveNodePath: ( path: string ) => void;
	activeNodePath: string;
	showCheckboxes: boolean;
	parentCheckState?: FileBrowserNodeCheckNode;
	pushUpdateToParent?: ( child: FileBrowserNodeCheckNode ) => void;
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
	showCheckboxes,
	parentCheckState,
	pushUpdateToParent,
	parentItem,
} ) => {
	const isRoot = path === '/';
	const isCurrentNodeClicked = activeNodePath === path;
	const [ fetchContentsOnMount, setFetchContentsOnMount ] = useState< boolean >( isRoot );
	const [ isOpen, setIsOpen ] = useState< boolean >( isRoot );
	const getInitialStateFromParent = (): FileBrowserNodeCheckNode | null => {
		if ( parentCheckState ) {
			const childNode = parentCheckState.children.find( ( child: FileBrowserNodeCheckNode ) => {
				return child.id === path;
			} );
			if ( childNode ) {
				return {
					id: childNode.id,
					status: childNode.status,
					children: childNode.children,
				};
			}
		}
		return {
			id: path,
			status: parentCheckState ? parentCheckState.status : 'unchecked',
			children: [],
		};
	};
	const backingCheckNode: FileBrowserNodeCheckNode = getInitialStateFromParent();
	const [ checkNode, setCheckNode ] = useState< FileBrowserNodeCheckNode >( backingCheckNode );

	// Update the status of the current node based on any children
	const getCheckedStatus = ( nodeToIterate: FileBrowserNodeCheckNode ) => {
		let isMixed = false;
		let isChecked = false;
		let isUnchecked = false;
		nodeToIterate.children.forEach( ( child: FileBrowserNodeCheckNode ) => {
			if ( child.status === 'mixed' ) {
				isMixed = true;
			} else if ( child.status === 'checked' ) {
				isChecked = true;
			} else {
				isUnchecked = true;
			}
		} );
		if ( isMixed ) {
			return 'mixed';
		} else if ( isChecked && isUnchecked ) {
			return 'mixed';
		} else if ( isChecked ) {
			return 'checked';
		}
		return 'unchecked';
	};

	// Find the child node based on childNode.id in the checkNode.children array
	// Remove that element from the array
	// Insert childNode into the array
	const updateFromChild = ( childNode: FileBrowserNodeCheckNode ) => {
		backingCheckNode.children = backingCheckNode.children.filter(
			( child: FileBrowserNodeCheckNode ) => {
				if ( child.id === childNode.id ) {
					return false;
				}
				return true;
			}
		);
		backingCheckNode.children.push( childNode );
		backingCheckNode.status = getCheckedStatus( backingCheckNode );
		const newCheckNode = { ...backingCheckNode };
		setCheckNode( newCheckNode );
	};

	const {
		isSuccess,
		isInitialLoading,
		data: backupFiles,
	} = useBackupContentsQuery( siteId, rewindId, path, fetchContentsOnMount );

	const changeCheckStatusTo = ( status: 'checked' | 'unchecked' | 'mixed' ) => {
		backingCheckNode.status = status;
		// Update the status of all children locally to prevent having a 'mixed' state as they
		// update one by one and call pushUpdateToParent
		if ( status !== 'mixed' ) {
			backingCheckNode.children.forEach( ( child: FileBrowserNodeCheckNode ) => {
				child.status = status;
			} );
		}
		const newCheckNode = { ...backingCheckNode };
		setCheckNode( newCheckNode );
	};

	useEffect( () => {
		if ( pushUpdateToParent ) {
			pushUpdateToParent( checkNode );
		}
	}, [ checkNode ] );

	useEffect( () => {
		if ( parentCheckState ) {
			if ( 'mixed' === parentCheckState.status ) {
				return;
			}
			if ( backingCheckNode.status === parentCheckState.status ) {
				return;
			}
			changeCheckStatusTo( parentCheckState.status );
		}
	}, [ parentCheckState ] );

	useEffect( () => {
		// When it is no longer the current node clicked, close the node
		if ( ! isCurrentNodeClicked && ! isRoot ) {
			setIsOpen( false );
		}
	}, [ isCurrentNodeClicked, isRoot ] );

	// A simple toggle.  Mixed will go to unchecked.
	const onCheckboxChange = () => {
		// TODO: return this to 1 line after removing debug code
		const newStatus = checkNode.status === 'unchecked' ? 'checked' : 'unchecked';
		changeCheckStatusTo( newStatus );
	};

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
						showCheckboxes={ showCheckboxes }
						pushUpdateToParent={ updateFromChild }
						parentCheckState={ checkNode }
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
		if ( ! showCheckboxes ) {
			return;
		}

		return (
			<FormCheckbox
				checked={ checkNode.status === 'checked' || checkNode.status === 'mixed' }
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
