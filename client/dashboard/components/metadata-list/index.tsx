import { __experimentalHStack as HStack, __experimentalText as Text } from '@wordpress/components';
import './style.scss';

interface MetadataListProps {
	children: React.ReactElement[];
}

const MetadataList = ( { children }: MetadataListProps ) => {
	return (
		<HStack className="dashboard-metadata-list" spacing={ 1 } justify="flex-start" wrap>
			{ children }
		</HStack>
	);
};

const MetadataItem = ( {
	children,
	title,
}: {
	children?: React.ReactNode;
	title?: React.ReactNode;
} ) => {
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
