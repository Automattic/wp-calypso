import {
	Button,
	Dropdown,
	DropdownMenu,
	MenuGroup,
	MenuItemsChoice,
	SearchControl,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Icon, cog, funnel } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';

export type SortOrder = 'newest_replies' | 'most_active';
export type Density = 'comfortable' | 'balanced' | 'compact';

interface Props {
	search: string;
	onSearchChange: ( search: string ) => void;
	sort: SortOrder;
	onSortChange: ( sort: SortOrder ) => void;
	density: Density;
	onDensityChange: ( density: Density ) => void;
}

export function ConversationListToolbar( {
	search,
	onSearchChange,
	sort,
	onSortChange,
	density,
	onDensityChange,
}: Props ) {
	const translate = useTranslate();

	const sortChoices: { value: SortOrder; label: string }[] = [
		{ value: 'newest_replies', label: translate( 'Newest replies' ) },
		{ value: 'most_active', label: translate( 'Most active' ) },
	];

	return (
		<HStack spacing={ 1 } expanded={ false } className="conversations-inbox__toolbar">
			<SearchControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				value={ search }
				onChange={ onSearchChange }
				label={ translate( 'Search conversations' ) }
			/>
			<DropdownMenu
				icon={ funnel }
				label={ translate( 'Sort conversations' ) }
				toggleProps={ { __next40pxDefaultSize: true } }
				popoverProps={ { placement: 'bottom-end' } }
			>
				{ ( { onClose } ) => (
					<MenuGroup>
						<MenuItemsChoice
							choices={ sortChoices }
							value={ sort }
							onSelect={ ( value ) => {
								onSortChange( value as SortOrder );
								onClose();
							} }
							onHover={ () => {} }
						/>
					</MenuGroup>
				) }
			</DropdownMenu>
			<Dropdown
				popoverProps={ { placement: 'bottom-end' } }
				renderToggle={ ( { isOpen, onToggle } ) => (
					<Button
						__next40pxDefaultSize
						icon={ <Icon icon={ cog } /> }
						label={ translate( 'Settings' ) }
						showTooltip
						aria-expanded={ isOpen }
						onClick={ onToggle }
					/>
				) }
				renderContent={ () => (
					<VStack spacing={ 4 } className="conversations-inbox__settings">
						<HStack>
							<Heading level={ 2 } size={ 15 } weight={ 500 } color="inherit">
								{ translate( 'Appearance' ) }
							</Heading>
							<Button variant="link" onClick={ () => onDensityChange( 'comfortable' ) }>
								{ translate( 'Reset view' ) }
							</Button>
						</HStack>
						<ToggleGroupControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							isBlock
							label={ translate( 'Density' ) }
							value={ density }
							onChange={ ( next ) => onDensityChange( next as Density ) }
						>
							<ToggleGroupControlOption value="comfortable" label={ translate( 'Comfortable' ) } />
							<ToggleGroupControlOption value="balanced" label={ translate( 'Balanced' ) } />
							<ToggleGroupControlOption value="compact" label={ translate( 'Compact' ) } />
						</ToggleGroupControl>
					</VStack>
				) }
			/>
		</HStack>
	);
}
