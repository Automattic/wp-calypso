/**
 * External Dependencies
 */
import { Dropdown, MenuItem, NavigableMenu, Path, SVG, Toolbar } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __ } from '../../utils/i18n';
import { AD_FORMATS } from './constants';

const label = __( 'Pick an ad format' );

export default function FormatPicker( { value, onChange } ) {
	return (
		<Dropdown
			position="bottom right"
			renderToggle={ ( { onToggle, isOpen } ) => {
				return (
					<Toolbar
						controls={ [
							{
								icon: (
									<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
										<Path fill="none" d="M0 0h24v24H0V0z" />
										<Path d="M1 9h2V7H1v2zm0 4h2v-2H1v2zm0-8h2V3c-1.1 0-2 .9-2 2zm8 16h2v-2H9v2zm-8-4h2v-2H1v2zm2 4v-2H1c0 1.1.9 2 2 2zM21 3h-8v6h10V5c0-1.1-.9-2-2-2zm0 14h2v-2h-2v2zM9 5h2V3H9v2zM5 21h2v-2H5v2zM5 5h2V3H5v2zm16 16c1.1 0 2-.9 2-2h-2v2zm0-8h2v-2h-2v2zm-8 8h2v-2h-2v2zm4 0h2v-2h-2v2z" />
									</SVG>
								),
								title: label,
								onClick: onToggle,
								extraProps: { 'aria-expanded': isOpen },
								className: 'wp-block-jetpack-wordads__format-picker-icon',
							},
						] }
					/>
				);
			} }
			renderContent={ ( { onClose } ) => (
				<NavigableMenu className="wp-block-jetpack-wordads__format-picker">
					{ AD_FORMATS.map( ( { tag, name, icon } ) => (
						<MenuItem
							className={ tag === value ? 'is-active' : undefined }
							icon={ icon }
							isSelected={ tag === value }
							key={ tag }
							onClick={ () => {
								onChange( tag );
								onClose();
							} }
							role="menuitemcheckbox"
						>
							{ name }
						</MenuItem>
					) ) }
				</NavigableMenu>
			) }
		/>
	);
}
