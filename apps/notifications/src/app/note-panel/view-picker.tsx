import {
	Button,
	CheckboxControl,
	Dropdown,
	ExternalLink,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';
import { useDispatch, useSelector } from 'react-redux';
import { PINNED_VIEW_NAMES, type StoredView } from '../../common/premade-views';
import { logError } from '../../panel/helpers/log-error';
import { updateNotificationViews } from '../../panel/rest-client/wpcom';
import actions from '../../panel/state/actions';
import getViews from '../../panel/state/selectors/get-views';

// Relative so the link stays on the host the panel is running in; an absolute
// wordpress.com URL would send an internal environment to production, where the feature
// flag is off and the route redirects away.
const SETTINGS_URL = '/me/notifications/ui';

type PickerView = {
	name: string;
	label: string;
	hidden: boolean;
};

/**
 * Adds and removes views from the tab strip.
 *
 * Toggling saves straight away — there is no Save button in a panel this small — and the
 * store is updated first so the tab appears without waiting for the round trip.
 */
const ViewPicker = ( { views }: { views: PickerView[] } ) => {
	const storedViews = useSelector( getViews ) as StoredView[];
	const dispatch = useDispatch();

	const toggleView = ( name: string, isVisible: boolean ) => {
		// Write the whole resolved list, not just the toggled view: it carries the order
		// as well, so a partial write would drop it. The pinned views are always shown
		// and always first, so they stay out of the stored value.
		const next = views
			.filter( ( view ) => ! PINNED_VIEW_NAMES.includes( view.name ) )
			.map( ( view ) => ( {
				name: view.name,
				hidden: view.name === name ? ! isVisible : view.hidden,
			} ) );

		dispatch( actions.ui.setViews( next ) );
		// `Promise.resolve().then` so a synchronous throw — an uninitialised REST client,
		// say — lands in the same catch as a failed request and still rolls back.
		Promise.resolve()
			.then( () => updateNotificationViews( next ) )
			.catch( ( error: unknown ) => {
				logError( error );
				dispatch( actions.ui.setViews( storedViews ) );
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
						{ views.map( ( { name, label, hidden } ) => (
							<CheckboxControl
								__nextHasNoMarginBottom
								key={ name }
								label={ label }
								checked={ ! hidden }
								disabled={ PINNED_VIEW_NAMES.includes( name ) }
								onChange={ ( isVisible ) => {
									// Close on toggle: adding a view widens the tab strip, which moves the
									// button this popover is anchored to, and it would jump under the cursor.
									toggleView( name, isVisible );
									onClose();
								} }
							/>
						) ) }
					</VStack>
					<ExternalLink href={ SETTINGS_URL }>{ __( 'Manage views' ) }</ExternalLink>
				</VStack>
			) }
		/>
	);
};

export default ViewPicker;
