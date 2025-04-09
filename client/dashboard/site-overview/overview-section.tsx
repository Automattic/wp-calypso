import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalGrid as Grid,
	__experimentalHeading as Heading,
	DropdownMenu,
	MenuGroup,
	MenuItem,
} from '@wordpress/components';
import { more } from '@wordpress/icons';
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

export default function OverviewSection( { title, actions, children }: OverviewSectionProps ) {
	return (
		<VStack spacing={ 4 }>
			<HStack>
				<Heading level={ 3 }>{ title }</Heading>
				<OverviewSectionActionMenu actions={ actions } />
			</HStack>
			<Grid columns={ 3 } gap={ 4 } templateColumns="repeat(3, minmax(0, 1fr))">
				{ children }
			</Grid>
		</VStack>
	);
}
