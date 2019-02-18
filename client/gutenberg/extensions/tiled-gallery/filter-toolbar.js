/**
 * External Dependencies
 */
import { Dropdown, MenuItem, NavigableMenu, Path, SVG, Toolbar } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __, _x } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

const availableFilters = [
	{
		icon: (
			/* Custom icon */
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M0 0h24v24H0V0z" />
				<Path d="M14 5V3H6.6l2 2zM21 10h-2v5.3l2 2zM17 10l.9-2.1L20 7l-2.1-.9L17 4l-.9 2.1L14 7l2.1.9zM22.4 21.6l-20-20L1 3l2 2v14c0 1.1.9 2 2 2h14l2 2 1.4-1.4zM5 19V7l4.4 4.4L8 12l2.8 1.2L12 16l.6-1.4L17 19H5z" />
			</SVG>
		),
		title: _x( 'Original', 'image style' ),
		value: undefined,
	},
	{
		icon: (
			/* Material Black and White icon */
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path d="M0 0h24v24H0z" fill="none" />
				<Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16l-7-8v8H5l7-8V5h7v14z" />
			</SVG>
		),
		title: _x( 'Black and White', 'image style' ),
		value: 'black-and-white',
	},
	{
		icon: (
			/* Material Vintage icon */
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M0 0h24v24H0V0z" />
				<Path d="M18.7 12.4c-.28-.16-.57-.29-.86-.4.29-.11.58-.24.86-.4 1.92-1.11 2.99-3.12 3-5.19-.91-.52-1.95-.8-3.01-.8-1.02 0-2.05.26-2.99.8-.28.16-.54.35-.78.54.05-.31.08-.63.08-.95 0-2.22-1.21-4.15-3-5.19C10.21 1.85 9 3.78 9 6c0 .32.03.64.08.95-.24-.2-.5-.39-.78-.55-.94-.54-1.97-.8-2.99-.8-1.05 0-2.1.28-3.01.8 0 2.07 1.07 4.08 3 5.19.28.16.57.29.86.4-.29.11-.58.24-.86.4-1.92 1.11-2.99 3.12-3 5.19.91.52 1.95.8 3.01.8 1.02 0 2.05-.26 2.99-.8.28-.16.54-.35.78-.54-.05.32-.08.64-.08.96 0 2.22 1.21 4.15 3 5.19 1.79-1.04 3-2.97 3-5.19 0-.32-.03-.64-.08-.95.24.2.5.38.78.54.94.54 1.97.8 2.99.8 1.05 0 2.1-.28 3.01-.8-.01-2.07-1.08-4.08-3-5.19zm-2.54-3.88c.21-.17.38-.29.54-.37.61-.35 1.3-.54 2-.54.27 0 .53.03.79.08-.31.91-.94 1.69-1.78 2.18-.17.1-.36.18-.58.27l-1.38.52c-.17-.46-.41-.87-.72-1.24l1.13-.9zM12 3.37c.63.72 1 1.66 1 2.63 0 .19-.02.41-.05.63l-.23 1.44C12.48 8.03 12.24 8 12 8s-.48.03-.71.07l-.23-1.44C11.02 6.41 11 6.19 11 6c0-.98.37-1.91 1-2.63zM4.51 7.68c.26-.06.53-.08.8-.08.69 0 1.38.18 1.99.54.15.09.32.2.49.35l1.15.96c-.3.36-.53.76-.7 1.2l-1.38-.52c-.21-.09-.4-.18-.56-.27-.87-.5-1.49-1.27-1.79-2.18zm3.33 7.79c-.21.17-.38.29-.54.37-.61.35-1.3.54-2 .54-.27 0-.53-.03-.79-.08.31-.91.94-1.69 1.78-2.18.17-.1.36-.18.58-.27l1.38-.52c.16.46.41.88.72 1.24l-1.13.9zM12 20.63c-.63-.72-1-1.66-1-2.63 0-.2.02-.41.06-.65l.22-1.42c.23.04.47.07.72.07.24 0 .48-.03.71-.07l.23 1.44c.04.22.06.44.06.63 0 .98-.37 1.91-1 2.63zm6.69-4.24c-.69 0-1.38-.18-1.99-.54-.18-.1-.34-.22-.49-.34l-1.15-.96c.3-.36.54-.76.7-1.21l1.38.52c.22.08.41.17.57.26.85.49 1.47 1.27 1.78 2.18-.27.07-.54.09-.8.09z" />
			</SVG>
		),
		title: _x( 'Sepia', 'image style' ),
		value: 'sepia',
	},
	{
		icon: (
			/* Custom icon */
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M0 0h24v24H0V0z" />
				<Path d="M18.8 15l3-4.5V9h-4.5v1.5h3l-3 4.5h1.5zm-5.5 0l3-4.5V9h-4.5v1.5h3l-3 4.5h1.5zm-2.5-1.5c0 .8-.7 1.5-1.5 1.5H7v-1.5h2.3v-.8h-.8c-.8 0-1.5-.7-1.5-1.5v-.8C7 9.7 7.7 9 8.5 9h.8c.8 0 1.5.7 1.5 1.5v3zm-2.3-2.3h.8v-.8h-.8v.8zM6 15V9H3v1.5h1.5V15H6z" />
			</SVG>
		),
		title: '1977',
		value: '1977',
	},
	{
		icon: (
			/* Material Tonality icon */
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M0 0h24v24H0V0z" />
				<Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2-15.86c1.03.13 2 .45 2.87.93H13v-.93zM13 7h5.24c.25.31.48.65.68 1H13V7zm0 3h6.74c.08.33.15.66.19 1H13v-1zm0 9.93V19h2.87c-.87.48-1.84.8-2.87.93zM18.24 17H13v-1h5.92c-.2.35-.43.69-.68 1zm1.5-3H13v-1h6.93c-.04.34-.11.67-.19 1z" />
			</SVG>
		),
		title: _x( 'Clarendon', 'image style' ),
		value: 'clarendon',
	},
	{
		icon: (
			/* Material Drama icon */
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M0 0h24v24H0V0z" />
				<Path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.61 5.64 5.36 8.04 2.35 8.36 0 10.9 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4h2c0-2.76-1.86-5.08-4.4-5.78C8.61 6.88 10.2 6 12 6c3.03 0 5.5 2.47 5.5 5.5v.5H19c1.65 0 3 1.35 3 3s-1.35 3-3 3z" />
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
