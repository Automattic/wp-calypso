import { Button, privateApis } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { PINNED_VIEW_NAMES, type StoredView } from '../../common/premade-views';
import actions from '../../panel/state/actions';
import getViews from '../../panel/state/selectors/get-views';
import { useSavePreference } from './use-save-preference';

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);

const { Menu } = unlock( privateApis );

type PickerView = {
	name: string;
	label: string;
	hidden: boolean;
};

const ViewPicker = ( { views, className }: { views: PickerView[]; className?: string } ) => {
	const storedViews = useSelector( getViews ) as StoredView[];
	const savePreference = useSavePreference();

	// The pinned views are always shown and always first, so they stay out of the stored
	// value; the rest is written whole, because its order is the order they appear in.
	const orderable = views.filter( ( view ) => ! PINNED_VIEW_NAMES.includes( view.name ) );

	const toggleView = ( name: string, isVisible: boolean ) => {
		const next = orderable.map( ( view ) => ( {
			name: view.name,
			hidden: view.name === name ? ! isVisible : view.hidden,
		} ) );

		savePreference( {
			key: 'notifications-views',
			value: next,
			apply: () => actions.ui.setViews( next ),
			revert: () => actions.ui.setViews( storedViews ),
		} );
	};

	return (
		<Menu placement="bottom-end">
			<Menu.TriggerButton
				render={
					<Button
						size="small"
						icon={ plus }
						label={ __( 'Add or remove views' ) }
						className={ clsx( 'wpnc-app__view-picker', className ) }
					/>
				}
			/>
			{ /* Modal lays a backdrop over the panel, swallowing the click that closes it. */ }
			<Menu.Popover modal={ false }>
				<Menu.Group>
					<Menu.GroupLabel>{ __( 'Views' ) }</Menu.GroupLabel>
					{ views.map( ( { name, label, hidden } ) => {
						const isPinned = PINNED_VIEW_NAMES.includes( name );

						return (
							<Menu.CheckboxItem
								key={ name }
								name="notifications-views"
								value={ name }
								checked={ isPinned || ! hidden }
								disabled={ isPinned }
								onChange={ () => toggleView( name, hidden ) }
							>
								<Menu.ItemLabel>{ label }</Menu.ItemLabel>
							</Menu.CheckboxItem>
						);
					} ) }
				</Menu.Group>
			</Menu.Popover>
		</Menu>
	);
};

export default ViewPicker;
