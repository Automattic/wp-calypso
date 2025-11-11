import { __experimentalHStack as HStack, __experimentalText as Text } from '@wordpress/components';
import clsx from 'clsx';
import './style.scss';

interface FieldListProps {
	fields: React.ReactElement[];
	className?: string;
}

const FieldList = ( { fields, className }: FieldListProps ) => {
	return (
		<HStack
			className={ clsx( 'dashboard-field-list', className ) }
			spacing={ 1 }
			justify="flex-start"
		>
			{ fields }
		</HStack>
	);
};

const Field = ( { children, title }: { children: React.ReactNode; title?: React.ReactNode } ) => {
	return (
		<HStack
			className="dashboard-field-list-field"
			spacing={ 1 }
			style={ { width: 'auto', flexShrink: 0 } }
		>
			{ title && <Text variant="muted">{ title }</Text> }
			<div className="dashboard-field-list-field-children">{ children }</div>
		</HStack>
	);
};

export { FieldList, Field };
