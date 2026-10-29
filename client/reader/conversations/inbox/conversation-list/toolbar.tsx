import {
	Button,
	DropdownMenu,
	MenuGroup,
	MenuItemsChoice,
	SearchControl,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { Icon, cog, funnel } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';

export type SortOrder = 'newest_replies' | 'most_active';

interface Props {
	search: string;
	onSearchChange: ( search: string ) => void;
	sort: SortOrder;
	onSortChange: ( sort: SortOrder ) => void;
}

export function ConversationListToolbar( { search, onSearchChange, sort, onSortChange }: Props ) {
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
			<Button
				__next40pxDefaultSize
				icon={ <Icon icon={ cog } /> }
				label={ translate( 'Settings are coming soon' ) }
				showTooltip
				disabled
				accessibleWhenDisabled
			/>
		</HStack>
	);
}
