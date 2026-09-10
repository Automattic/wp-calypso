import {
	Button,
	CheckboxControl,
	Dropdown,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';
import { useSelector } from 'react-redux';
import { PINNED_VIEW_NAMES, type StoredView } from '../../common/premade-views';
import actions from '../../panel/state/actions';
import getViews from '../../panel/state/selectors/get-views';
import { useSavePreference } from './use-save-preference';

type PickerView = {
	name: string;
	label: string;
	hidden: boolean;
};

const ViewPicker = ( { views }: { views: PickerView[] } ) => {
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
			preferences: { 'notifications-views': next },
			apply: () => actions.ui.setViews( next ),
			revert: () => actions.ui.setViews( storedViews ),
		} );
	};

	return (
		<Dropdown
			className="wpnc-app__view-picker"
			popoverProps={ { placement: 'bottom-end' } }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					size="small"
					icon={ plus }
					onClick={ onToggle }
					aria-expanded={ isOpen }
					label={ __( 'Add or remove views' ) }
				/>
			) }
			renderContent={ ( { onClose } ) => (
				<VStack spacing={ 3 } style={ { minWidth: '200px', padding: '8px' } }>
					<Heading level={ 3 } size={ 13 } weight={ 500 }>
						{ __( 'Views' ) }
					</Heading>
					<VStack spacing={ 2 }>
						{ views
							.filter( ( { name } ) => PINNED_VIEW_NAMES.includes( name ) )
							.map( ( { name, label } ) => (
								<CheckboxControl
									__nextHasNoMarginBottom
									key={ name }
									label={ label }
									checked
									disabled
									onChange={ () => {} }
								/>
							) ) }
						{ orderable.map( ( { name, label, hidden } ) => (
							<CheckboxControl
								__nextHasNoMarginBottom
								key={ name }
								label={ label }
								checked={ ! hidden }
								onChange={ ( isVisible ) => {
									toggleView( name, isVisible );
									// Adding a view widens the tab strip, which moves the button this
									// popover is anchored to; it would jump out from under the cursor.
									onClose();
								} }
							/>
						) ) }
					</VStack>
				</VStack>
			) }
		/>
	);
};

export default ViewPicker;
