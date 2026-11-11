import {
	__experimentalHeading as Heading,
	Button,
	Modal,
	Navigator,
	useNavigator,
} from '@wordpress/components';
import { __, isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight, close } from '@wordpress/icons';
import clsx from 'clsx';
import { useEffect, useId, useRef, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { DevSiteConfiguration } from '../../marketplace/purchases/site-configuration-modal';
import { ConnectSiteForm, getConnectSiteTitle } from './connect-site-modal';
import { ImportFromWPCOM, getImportFromWPCOMTitle } from './import-from-wpcom-modal';
import AddNewSite from './index';
import type { AddNewSiteAction } from './types';
import type useSiteSimulation from '../../design-preview/use-site-simulation';
import type { ReactNode } from 'react';

export type AddSiteView = 'menu' | AddNewSiteAction;

const PATHS: Record< AddSiteView, string > = {
	menu: '/',
	'import-from-wpcom': '/import',
	'a4a-connection': '/a4a-plugin',
	'jetpack-connection': '/jetpack-plugin',
	'dev-site-configurations': '/development-site',
};

/** Matches the option picked, so the screen reads as where you just went. */
function getScreenTitle( view: AddNewSiteAction ) {
	switch ( view ) {
		case 'import-from-wpcom':
			return __( 'WordPress.com sites' );
		case 'a4a-connection':
			return __( 'A4A plugin' );
		case 'jetpack-connection':
			return __( 'Jetpack plugin' );
		case 'dev-site-configurations':
			return __( 'Development site' );
	}
}

function getTitle( view: AddSiteView ) {
	switch ( view ) {
		case 'menu':
			return __( 'Add site' );
		case 'import-from-wpcom':
			return getImportFromWPCOMTitle();
		case 'dev-site-configurations':
			return __( 'Configure your new site' );
		default:
			return getConnectSiteTitle( view );
	}
}

interface AddSiteModalProps {
	initialView: AddSiteView;
	onClose: () => void;
	simulation?: ReturnType< typeof useSiteSimulation >;
}

interface ChromeProps {
	headingId: string;
	canClose: boolean;
	onRequestClose: () => void;
}

/**
 * Every screen carries the modal's own header, so Back sits beside the title
 * and the close button, the way Navigator screens do in the editor.
 */
function Screen( {
	path,
	title,
	canGoBack,
	isForm,
	chrome,
	children,
}: {
	path: string;
	title: string;
	canGoBack: boolean;
	isForm?: boolean;
	chrome: ChromeProps;
	children: ReactNode;
} ) {
	return (
		<Navigator.Screen path={ path } className="agency-add-site-modal__screen">
			<div className="agency-add-site-modal__header">
				{ canGoBack && (
					<Navigator.BackButton
						icon={ isRTL() ? chevronRight : chevronLeft }
						label={ __( 'Back' ) }
						size="compact"
					/>
				) }
				<Heading level={ 1 } size={ 20 } weight={ 500 } id={ chrome.headingId }>
					{ title }
				</Heading>
				{ chrome.canClose && (
					<Button
						icon={ close }
						label={ __( 'Close' ) }
						size="compact"
						onClick={ chrome.onRequestClose }
					/>
				) }
			</div>
			<div className={ clsx( 'agency-add-site-modal__body', isForm && 'is-form' ) }>
				{ children }
			</div>
		</Navigator.Screen>
	);
}

function Screens( {
	initialView,
	chrome,
	onClose,
	onBusyChange,
	simulation,
}: {
	initialView: AddSiteView;
	chrome: ChromeProps;
	onClose: () => void;
	onBusyChange: ( isBusy: boolean ) => void;
	simulation?: AddSiteModalProps[ 'simulation' ];
} ) {
	const { goTo } = useNavigator();
	const fromMenu = initialView === 'menu';
	// Opened straight on a screen, that screen is the whole modal: no Back, and
	// it keeps the title it would have had as its own modal.
	const titleFor = ( view: AddNewSiteAction ) =>
		fromMenu ? getScreenTitle( view ) : getTitle( view );

	return (
		<>
			<Screen
				path={ PATHS.menu }
				title={ getTitle( 'menu' ) }
				canGoBack={ false }
				chrome={ chrome }
			>
				<AddNewSite
					onSelectAction={ ( action ) => goTo( PATHS[ action ] ) }
					preview={ simulation ? { availableDevSites: simulation.availableDevSites } : undefined }
				/>
			</Screen>
			<Screen
				path={ PATHS[ 'import-from-wpcom' ] }
				title={ titleFor( 'import-from-wpcom' ) }
				canGoBack={ fromMenu }
				chrome={ chrome }
			>
				<ImportFromWPCOM
					onClose={ onClose }
					onImportingChange={ onBusyChange }
					preview={ simulation?.import }
				/>
			</Screen>
			{ ( [ 'a4a-connection', 'jetpack-connection' ] as const ).map( ( action ) => (
				<Screen
					key={ action }
					path={ PATHS[ action ] }
					title={ titleFor( action ) }
					canGoBack={ fromMenu }
					isForm
					chrome={ chrome }
				>
					<ConnectSiteForm
						action={ action }
						onClose={ onClose }
						onPreviewConnect={ simulation?.onConnect }
					/>
				</Screen>
			) ) }
			<Screen
				path={ PATHS[ 'dev-site-configurations' ] }
				title={ titleFor( 'dev-site-configurations' ) }
				canGoBack={ fromMenu }
				isForm
				chrome={ chrome }
			>
				<DevSiteConfiguration
					closeModal={ onClose }
					onCreatingChange={ onBusyChange }
					preview={ simulation?.development }
				/>
			</Screen>
		</>
	);
}

/**
 * Every way to add a site, in one modal. Picking an option slides its screen in
 * place, so nothing stacks or flashes closed between steps. The modal keeps one
 * size throughout; a long screen scrolls under a pinned header and actions.
 */
export default function AddSiteModal( { initialView, onClose, simulation }: AddSiteModalProps ) {
	const { recordTracksEvent } = useAnalytics();
	const [ isBusy, setIsBusy ] = useState( false );
	const headingId = useId();
	const navigatorRef = useRef< HTMLDivElement >( null );

	// The modal content is what scrolls. Mark when something sits hidden above
	// or below so the header and actions can draw a divider only then.
	useEffect( () => {
		const root = navigatorRef.current;
		const scroller = root?.closest( '.components-modal__content' );
		if ( ! root || ! scroller ) {
			return;
		}
		const update = () => {
			root.dataset.scrolled = String( scroller.scrollTop > 0 );
			root.dataset.moreBelow = String(
				scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 1
			);
		};
		update();
		scroller.addEventListener( 'scroll', update, { passive: true } );
		const observer = new ResizeObserver( update );
		observer.observe( root );
		return () => {
			scroller.removeEventListener( 'scroll', update );
			observer.disconnect();
		};
	}, [] );

	const onRequestClose = () => {
		if ( initialView === 'dev-site-configurations' ) {
			recordTracksEvent( 'calypso_a4a_create_site_config_close' );
		}
		onClose();
	};

	return (
		<Modal
			title={ getTitle( initialView ) }
			__experimentalHideHeader
			aria={ { labelledby: headingId } }
			className="agency-add-site-modal-frame"
			onRequestClose={ onRequestClose }
			// Closing mid-import or mid-creation drops the request's callbacks, so
			// nothing refreshes the list or says how it went.
			isDismissible={ ! isBusy }
			shouldCloseOnEsc={ ! isBusy }
			shouldCloseOnClickOutside={ ! isBusy }
		>
			<Navigator
				ref={ navigatorRef }
				initialPath={ PATHS[ initialView ] }
				className="agency-add-site-modal"
			>
				<Screens
					initialView={ initialView }
					chrome={ { headingId, canClose: ! isBusy, onRequestClose } }
					onClose={ onClose }
					onBusyChange={ setIsBusy }
					simulation={ simulation }
				/>
			</Navigator>
		</Modal>
	);
}
