import {
	Button,
	Dropdown,
	Icon,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	__experimentalItem as Item,
	__experimentalItemGroup as ItemGroup,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { check, plus } from '@wordpress/icons';
import clsx from 'clsx';
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
			preferences: { 'notifications-views': next },
			apply: () => actions.ui.setViews( next ),
			revert: () => actions.ui.setViews( storedViews ),
		} );
	};

	return (
		<Dropdown
			className={ clsx( 'wpnc-app__view-picker', className ) }
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
				<VStack spacing={ 3 } style={ { minWidth: '240px', padding: '8px' } }>
					<Heading level={ 3 } size={ 13 } weight={ 500 }>
						{ __( 'Views' ) }
					</Heading>
					<ItemGroup isBordered isSeparated size="medium">
						{ views.map( ( { name, label, hidden } ) => {
							const isPinned = PINNED_VIEW_NAMES.includes( name );
							const isVisible = isPinned || ! hidden;

							return (
								<Item
									key={ name }
									// Pinned views cannot be turned off. Without a handler the item
									// renders as static text rather than a button, which is what says
									// so — there is nothing to press.
									onClick={
										isPinned
											? undefined
											: () => {
													toggleView( name, hidden );
													// Adding a view widens the tab strip, which moves the
													// button this popover is anchored to; it would jump out
													// from under the cursor.
													onClose();
											  }
									}
									aria-pressed={ isPinned ? undefined : isVisible }
								>
									{ /* `left` is the only alignment that centres the row vertically without
									   also centring it horizontally. */ }
									<HStack alignment="left" spacing={ 2 } expanded={ false }>
										{ /* The slot is always there so the labels line up whether or not
										   the view is showing. */ }
										<div style={ { width: 24, height: 24 } }>
											{ isVisible && <Icon icon={ check } /> }
										</div>
										<span>{ label }</span>
									</HStack>
								</Item>
							);
						} ) }
					</ItemGroup>
				</VStack>
			) }
		/>
	);
};

export default ViewPicker;
