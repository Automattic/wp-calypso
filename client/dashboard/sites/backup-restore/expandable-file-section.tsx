import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { chevronDown, chevronRight } from '@wordpress/icons';
import { useState } from 'react';
import { Text } from '../../components/text';
import type { FileBrowserCheckListInfo } from '../../../my-sites/backup/backup-contents-page/file-browser/types';

type SectionType = 'file' | 'theme' | 'plugin' | 'table';

const SECTION_PATHS = {
	theme: '/wp-content/themes',
	plugin: '/wp-content/plugins',
	table: '/sql',
} as const;

const TYPE_LABELS = {
	file: __( 'Files and directories that will be restored' ),
	theme: {
		partial: __( 'WordPress Themes' ),
		all: __( 'All site themes will be restored' ),
	},
	plugin: {
		partial: __( 'WordPress Plugins' ),
		all: __( 'All site plugins will be restored' ),
	},
	table: {
		partial: __( 'Site Databases' ),
		all: __( 'All site database tables will be restored' ),
	},
} as const;

const getTypeLabel = ( type: SectionType, allSelected: boolean ) => {
	if ( type === 'file' ) {
		return TYPE_LABELS.file;
	}

	return allSelected ? TYPE_LABELS[ type ].all : TYPE_LABELS[ type ].partial;
};

const checkIfAllSelected = ( type: SectionType, selectedItems: FileBrowserCheckListInfo[] ) => {
	if ( type === 'file' ) {
		return false;
	}

	const sectionPath = SECTION_PATHS[ type ];
	return selectedItems.some( ( item ) => {
		if ( item.path === sectionPath || item.path === '/' ) {
			return true;
		}
		// Plugins and themes included if wp-content is selected
		return type !== 'table' && item.path === '/wp-content';
	} );
};

export default function ExpandableFileSection( {
	type,
	selectedItems,
}: {
	type: SectionType;
	selectedItems: FileBrowserCheckListInfo[];
} ) {
	const [ isExpanded, setIsExpanded ] = useState( true );

	// Filter items by type
	const filteredItems = selectedItems.filter(
		( item ) =>
			item.type === type && ! Object.values( SECTION_PATHS ).some( ( path ) => path === item.path )
	);

	// Handle empty sections
	if ( filteredItems.length === 0 ) {
		if ( type === 'file' || ! checkIfAllSelected( type, selectedItems ) ) {
			return null;
		}
		return <Text weight={ 500 }>{ getTypeLabel( type, true ) }</Text>;
	}

	const fileDisplayLimit = 10;
	const displayItems = filteredItems.slice( 0, fileDisplayLimit );
	const remainingCount = filteredItems.length - fileDisplayLimit;

	return (
		<div>
			<Button
				icon={ isExpanded ? chevronDown : chevronRight }
				iconPosition="right"
				onClick={ () => setIsExpanded( ! isExpanded ) }
				style={ { paddingInlineStart: 0, paddingTop: 0 } }
				variant="link"
			>
				<Text weight={ 500 }>{ getTypeLabel( type, false ) }</Text>
			</Button>
			{ isExpanded && (
				<VStack spacing={ 0 }>
					<ul style={ { paddingInlineStart: '18px' } }>
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
}
