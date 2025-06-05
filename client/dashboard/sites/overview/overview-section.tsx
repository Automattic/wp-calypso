import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalGrid as Grid,
	__experimentalHeading as Heading,
	DropdownMenu,
	MenuGroup,
	MenuItem,
} from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { more } from '@wordpress/icons';
import { useState } from 'react';
import type { ReactNode } from 'react';

function OverviewSectionActionMenu( { actions }: { actions?: OverviewSectionAction[] } ) {
	if ( ! actions?.length ) {
		return null;
	}
	return (
		<DropdownMenu icon={ more } label="Select a direction">
			{ ( { onClose } ) => (
				<>
					<MenuGroup>
						<MenuItem icon={ more } onClick={ onClose }>
							Move Up
						</MenuItem>
						<MenuItem icon={ more } onClick={ onClose }>
							Move Down
						</MenuItem>
					</MenuGroup>
				</>
			) }
		</DropdownMenu>
	);
}

interface OverviewSectionAction {
	label: string;
	onClick: () => void;
}

interface OverviewSectionProps {
	title: string;
	children: ReactNode;
	actions?: OverviewSectionAction[];
}

const BREAKPOINTS = {
	xlarge: { width: 780, columns: 3 },
	large: { width: 480, columns: 2 },
	mobile: { width: 0, columns: 1 },
};

function useGridStyles( containerWidth: number ) {
	for ( const [ , { width, columns } ] of Object.entries( BREAKPOINTS ) ) {
		if ( containerWidth >= width ) {
			return { gridTemplateColumns: `repeat(${ columns }, minmax(0, 1fr))` };
		}
	}
}

export default function OverviewSection( { title, actions, children }: OverviewSectionProps ) {
	const [ containerWidth, setContainerWidth ] = useState( 0 );
	const gridContainerRef = useResizeObserver(
		( resizeObserverEntries: ResizeObserverEntry[] ) => {
			setContainerWidth( resizeObserverEntries[ 0 ].borderBoxSize[ 0 ].inlineSize );
		},
		{ box: 'border-box' }
	);
	const gridStyles = useGridStyles( containerWidth );
	return (
		<VStack spacing={ 4 }>
			<HStack>
				<Heading level={ 3 }>{ title }</Heading>
				<OverviewSectionActionMenu actions={ actions } />
			</HStack>
			<Grid ref={ gridContainerRef } gap={ 6 } style={ gridStyles }>
				{ children }
			</Grid>
		</VStack>
	);
}
