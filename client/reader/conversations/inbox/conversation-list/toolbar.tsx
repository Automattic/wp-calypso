import { Button, SearchControl, __experimentalHStack as HStack } from '@wordpress/components';
import { Icon, cog, funnel } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';

interface Props {
	search: string;
	onSearchChange: ( search: string ) => void;
}

export function ConversationListToolbar( { search, onSearchChange }: Props ) {
	const translate = useTranslate();

	return (
		<HStack spacing={ 1 } expanded={ false } className="conversations-inbox__toolbar">
			<SearchControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				value={ search }
				onChange={ onSearchChange }
				label={ translate( 'Search conversations' ) }
			/>
			<Button
				__next40pxDefaultSize
				icon={ <Icon icon={ funnel } /> }
				label={ translate( 'Filters are coming soon' ) }
				showTooltip
				disabled
				accessibleWhenDisabled
			/>
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
