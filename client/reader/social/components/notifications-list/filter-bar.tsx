import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { CHIP_FILTERS, type ChipFilter } from './filter';

interface Props {
	value: ChipFilter;
	onChange: ( next: ChipFilter ) => void;
}

export function NotificationsFilterBar( { value, onChange }: Props ) {
	const translate = useTranslate();
	const labels: Record< ChipFilter, string > = {
		all: translate( 'All' ) as string,
		conversations: translate( 'Conversations' ) as string,
		likes: translate( 'Likes' ) as string,
		reposts: translate( 'Reposts' ) as string,
		follows: translate( 'Follows' ) as string,
	};
	const handleChange = ( next: string | number | undefined ) => {
		if ( typeof next === 'string' && CHIP_FILTERS.includes( next as ChipFilter ) ) {
			onChange( next as ChipFilter );
		}
	};
	return (
		<div className="social-notifications-filter-bar">
			<ToggleGroupControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				isBlock
				hideLabelFromVision
				label={ translate( 'Filter notifications by type' ) as string }
				value={ value }
				onChange={ handleChange }
			>
				{ CHIP_FILTERS.map( ( chip ) => (
					<ToggleGroupControlOption key={ chip } value={ chip } label={ labels[ chip ] } />
				) ) }
			</ToggleGroupControl>
		</div>
	);
}
