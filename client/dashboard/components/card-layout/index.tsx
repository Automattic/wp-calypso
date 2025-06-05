import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Card,
	CardBody,
} from '@wordpress/components';
import React, { forwardRef } from 'react';

function Header( { children }: { children: React.ReactNode } ) {
	return <VStack style={ { paddingBottom: '12px' } }>{ children }</VStack>;
}

function Fields( { children }: { children: React.ReactNode } ) {
	return (
		<VStack spacing={ 4 } style={ { padding: '8px 0' } }>
			{ children }
		</VStack>
	);
}

function ButtonGroup( { children }: { children: React.ReactNode } ) {
	return (
		<HStack justify="flex-start" spacing={ 3 } style={ { padding: '8px 0' } }>
			{ children }
		</HStack>
	);
}

function UnforwardedCardLayout(
	{ children }: { children: React.ReactNode },
	ref: React.ForwardedRef< HTMLDivElement >
) {
	return (
		<Card ref={ ref }>
			<CardBody>{ children }</CardBody>
		</Card>
	);
}

export const CardLayout = Object.assign( forwardRef( UnforwardedCardLayout ), {
	Header: Object.assign( Header, { displayName: 'CardLayout.Header' } ),
	Fields: Object.assign( Fields, { displayName: 'CardLayout.Fields' } ),
	ButtonGroup: Object.assign( ButtonGroup, { displayName: 'CardLayout.ButtonGroup' } ),
} );

/**
 * The CardLayout component is designed to provide a consistent layout structure across different pages.
 * It standardizes padding, spacing, and alignment to ensure visual consistency and reduce repetitive
 * styling in individual page components. By using CardLayout, we can maintain a unified look and feel
 * while also simplifying layout management across the dashboard.
 *
 * ```jsx
 *
 * function MyComponent() {
 * 	return (
 * 		<CardLayout>
 * 			<CardLayout.Header>
 * 				<SectionHeader />
 * 			</CardLayout.Header>
 * 			<CardLayout.Fields>
 * 				<DataForm />
 * 			</CardLayout.Fields>
 * 			<CardLayout.ButtonGroup>
 * 				<Button>Action</Button>
 * 			</CardLayout.ButtonGroup>
 * 		</CardLayout>
 * 	);
 * }
 * ```
 */
export default CardLayout;
