/**
 * External Dependencies
 */
import { Dropdown, MenuItem, NavigableMenu, Path, SVG, Toolbar } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __, _x } from '../../utils/i18n';

const availableFilters = [
	{
		icon: (
			/* No filter */
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M0 0h24v24H0V0z" />
				<Path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm18-4H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14z" />
			</SVG>
		),
		title: _x( 'Original', 'image style' ),
		value: undefined,
	},
	{
		icon: (
			/* 1 */
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M0 0h24v24H0V0z" />
				<Path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm11 10h2V5h-4v2h2v8zm7-14H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14z" />
			</SVG>
		),
		title: _x( 'Black and White', 'image style' ),
		value: 'black-and-white',
	},
	{
		icon: (
			/* 2 */
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M0 0h24v24H0V0z" />
				<Path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm18-4H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14zm-4-4h-4v-2h2c1.1 0 2-.89 2-2V7c0-1.11-.9-2-2-2h-4v2h4v2h-2c-1.1 0-2 .89-2 2v4h6v-2z" />
			</SVG>
		),
		title: _x( 'Sepia', 'image style' ),
		value: 'sepia',
	},
	{
		icon: (
			/* 3 */
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M0 0h24v24H0V0z" />
				<Path d="M21 1H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14zM3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm14 8v-1.5c0-.83-.67-1.5-1.5-1.5.83 0 1.5-.67 1.5-1.5V7c0-1.11-.9-2-2-2h-4v2h4v2h-2v2h2v2h-4v2h4c1.1 0 2-.89 2-2z" />
			</SVG>
		),
		title: '1977',
		value: '1977',
	},
	{
		icon: (
			/* 4 */
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M0 0h24v24H0V0z" />
				<Path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm12 10h2V5h-2v4h-2V5h-2v6h4v4zm6-14H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14z" />
			</SVG>
		),
		title: _x( 'Clarendon', 'image style' ),
		value: 'clarendon',
	},
	{
		icon: (
			/* 5 */
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M0 0h24v24H0z" />
				<Path d="M21 1H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 16H7V3h14v14zM3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5zm14 8v-2c0-1.11-.9-2-2-2h-2V7h4V5h-6v6h4v2h-4v2h4c1.1 0 2-.89 2-2z" />
			</SVG>
		),
		title: _x( 'Gingham', 'image style' ),
		value: 'gingham',
	},
];

const label = __( 'Pick an image filter' );

export default function FilterToolbar( { value, onChange } ) {
	return (
		<Dropdown
			position="bottom right"
			className="editor-block-switcher"
			contentClassName="editor-block-switcher__popover"
			renderToggle={ ( { onToggle, isOpen } ) => {
				return (
					<Toolbar
						controls={ [
							{
								onClick: onToggle,
								extraProps: {
									'aria-haspopup': 'true',
									'aria-expanded': isOpen,
								},
								title: label,
								tooltip: label,
								icon: (
									<SVG
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
									>
										<Path fill="none" d="M0 0h24v24H0V0z" />
										<Path d="M19 10v9H4.98V5h9V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-9h-2zm-2.94-2.06L17 10l.94-2.06L20 7l-2.06-.94L17 4l-.94 2.06L14 7zM12 8l-1.25 2.75L8 12l2.75 1.25L12 16l1.25-2.75L16 12l-2.75-1.25z" />
									</SVG>
								),
							},
						] }
					/>
				);
			} }
			renderContent={ ( { onClose } ) => {
				const applyOrUnset = nextValue => () => {
					onChange( value === nextValue ? undefined : nextValue );
					onClose();
				};
				return (
					<NavigableMenu className="tiled-gallery__filter-picker-menu">
						{ availableFilters.map( ( { icon, title, value: filterValue } ) => (
							<MenuItem
								className={ value === filterValue ? 'is-active' : undefined }
								icon={ icon }
								isSelected={ value === filterValue }
								key={ filterValue || 'original' }
								onClick={ applyOrUnset( filterValue ) }
								role="menuitemcheckbox"
							>
								{ title }
							</MenuItem>
						) ) }
					</NavigableMenu>
				);
			} }
		/>
	);
}
