import { Gridicon } from '@automattic/components';
import { Button, Dropdown, MenuItemsChoice, NavigableMenu } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { ReactElement, useMemo } from 'react';
import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export type Option< T > = {
	label: string;
	value: T;
};

type SortControlsProps< T > = {
	options: Option< T >[];
	value: T;
	onChange: ( sortOrder: T ) => void;
};

const SortControls: < T extends string >( props: SortControlsProps< T > ) => ReactElement = ( {
	options,
	value,
	onChange,
} ) => {
	const translate = useTranslate();
	const sortingLabel = useMemo(
		() => options.find( ( option ) => option.value === value )?.label,
		[ options, value ]
	);

	if ( ! sortingLabel ) {
		throw new Error( 'In SortControl, props.value must exist in props.options.' );
	}

	return (
		<Dropdown
			className="subscription-manager-sort-controls"
			position="bottom left"
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					className="subscription-manager-sort-controls__button"
					icon={ <Gridicon icon={ isOpen ? 'chevron-up' : 'chevron-down' } /> }
					iconSize={ 16 }
					onClick={ onToggle }
					aria-expanded={ isOpen }
					onKeyDown={ ( event: React.KeyboardEvent ) => {
						if ( ! isOpen && event.code === 'ArrowDown' ) {
							event.preventDefault();
							onToggle();
						}
					} }
				>
					{
						// translators: %s is the current sorting mode.
						translate( 'Sort: %(sortingLabel)s', { args: { sortingLabel } } )
					}
				</Button>
			) }
			renderContent={ ( { onClose } ) => (
				<NavigableMenu cycle={ false }>
					<MenuItemsChoice
						value={ value }
						onSelect={ ( selectedValue: string ) => {
							onChange( selectedValue as typeof value );
							onClose();
						} }
						choices={ options }
						onHover={ noop }
					/>
				</NavigableMenu>
			) }
		/>
	);
};

export default SortControls;
