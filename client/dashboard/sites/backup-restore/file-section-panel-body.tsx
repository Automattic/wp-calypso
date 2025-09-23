import { __experimentalVStack as VStack, PanelBody } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Text } from '../../components/text';
import type { FileBrowserCheckListInfo } from '../../../my-sites/backup/backup-contents-page/file-browser/types';

type SectionType = 'file' | 'theme' | 'plugin' | 'table';
const SECTION_PATHS = {
	theme: '/wp-content/themes',
	plugin: '/wp-content/plugins',
	table: '/sql',
} as const;

const TYPE_LABELS = {
	file: {
		title: __( 'Files and Directories' ),
		all: __( 'Files and directories that will be restored' ),
	},
	theme: {
		title: __( 'WordPress Themes' ),
		all: __( 'All site themes will be restored' ),
	},
	plugin: {
		title: __( 'WordPress Plugins' ),
		all: __( 'All site plugins will be restored' ),
	},
	table: {
		title: __( 'Site Databases' ),
		all: __( 'All site database tables will be restored' ),
	},
} as const;

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

export default function FileSectionPanelBody( {
	type,
	selectedItems,
}: {
	type: SectionType;
	selectedItems: FileBrowserCheckListInfo[];
} ) {
	// 1. Filter items by type, excluding section root paths (/sql, /wp-content/plugins, /wp-content/themes)
	const filteredItems = selectedItems.filter(
		( item ) =>
			item.type === type && ! Object.values( SECTION_PATHS ).some( ( path ) => path === item.path )
	);

	// 2. Hide empty sections unless it's a non-file type with "all items" selected
	if (
		filteredItems.length === 0 &&
		( type === 'file' || ! checkIfAllSelected( type, selectedItems ) )
	) {
		return null;
	}

	const fileDisplayLimit = 10;
	const displayItems = filteredItems.slice( 0, fileDisplayLimit );
	const remainingCount = filteredItems.length - fileDisplayLimit;

	const getPanelContent = () => {
		if ( checkIfAllSelected( type, selectedItems ) ) {
			return <Text>{ TYPE_LABELS[ type ].all }</Text>;
		}

		return (
			<VStack spacing={ 0 }>
				<ul style={ { paddingInlineStart: '18px', marginTop: 0 } }>
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
		);
	};

	return <PanelBody title={ TYPE_LABELS[ type ].title }>{ getPanelContent() }</PanelBody>;
}
