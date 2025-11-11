import { __experimentalHStack as HStack, __experimentalText as Text } from '@wordpress/components';
import './style.scss';

interface MetadataListProps {
	children?: React.ReactNode;
}

type MetadataItemProps =
	| { title: React.ReactNode; children?: React.ReactNode }
	| { title?: React.ReactNode; children: React.ReactNode };

const MetadataList = ( { children }: MetadataListProps ) => {
	if ( ! children ) {
		return null;
	}

	return (
		<HStack className="dashboard-metadata-list" spacing={ 1 } justify="flex-start" wrap>
			{ children }
		</HStack>
	);
};

const MetadataItem = ( { children, title }: MetadataItemProps ) => {
	if ( ! children && ! title ) {
		return null;
	}

	return (
		<HStack
			className="dashboard-metadata-list-item"
			spacing={ 1 }
			style={ { width: 'auto', flexShrink: 0 } }
		>
			{ title && <Text variant="muted">{ title }</Text> }
			{ children && <div className="dashboard-metadata-list-item-children">{ children }</div> }
		</HStack>
	);
};

export { MetadataList, MetadataItem };
