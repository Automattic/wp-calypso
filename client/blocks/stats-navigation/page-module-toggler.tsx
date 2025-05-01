import { Popover } from '@automattic/components';
import { FormToggle } from '@wordpress/components';
import { Icon, cog } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'calypso/state';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { updateModuleToggles } from 'calypso/state/stats/module-toggles/actions';
import './page-module-toggler.scss';
import { AVAILABLE_PAGE_MODULES, ModuleToggleItem } from './constants';

type PageModuleTogglerProps = {
	moduleToggles: { [ name: string ]: boolean };
	onToggleModule: ( module: string, isShow: boolean ) => void;
	isTooltipShown: boolean;
	onTooltipDismiss: () => void;
	customToggleIcon?: React.ReactNode;
	siteId: number;
	selectedItem: string;
};

// Helper to expose logic for default module listing.
export function getAvailablePageModules( selectedItem: string, hasVideoPress: boolean ) {
	return ( AVAILABLE_PAGE_MODULES[ selectedItem ] || [] ).map( ( toggleItem ) => {
		// Set the default VideoPress visibility based on the hasVideoPress parameter.
		// We update the disabled state as well but that value is currently ignored.
		if ( toggleItem.key === 'videos' ) {
			return {
				...toggleItem,
				disabled: ! hasVideoPress,
				defaultValue: hasVideoPress,
			};
		}

		return toggleItem;
	} );
}

export default function PageModuleToggler( {
	selectedItem,
	moduleToggles,
	siteId,
	isTooltipShown,
	onTooltipDismiss,
	customToggleIcon = <Icon className="gridicon" icon={ cog } />,
}: PageModuleTogglerProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ pageModules, setPageModules ] = useState( moduleToggles );
	const hasVideoPress = useSelector( ( state ) => siteHasFeature( state, siteId, 'videopress' ) );
	const availableModuleToggles = useSelector( () =>
		getAvailablePageModules( selectedItem, hasVideoPress )
	);

	// Use state to update the ref of the setting action button to avoid null element.
	const [ settingsActionRef, setSettingsActionRef ] = useState(
		useRef< HTMLButtonElement >( null )
	);
	const [ isSettingsMenuVisible, setIsSettingsMenuVisible ] = useState( false );

	const buttonRefCallback = useCallback( ( node: HTMLButtonElement ) => {
		if ( settingsActionRef.current === null ) {
			setSettingsActionRef( { current: node } );
		}
	}, [] );

	const toggleSettingsMenu = () => {
		onTooltipDismiss();
		setIsSettingsMenuVisible( ( isSettingsMenuVisible ) => {
			return ! isSettingsMenuVisible;
		} );
	};

	const onToggleModule = ( module: string, isShow: boolean ) => {
		const selectedPageModules = Object.assign( {}, pageModules );
		selectedPageModules[ module ] = isShow;
		setPageModules( selectedPageModules );

		dispatch(
			updateModuleToggles( siteId, {
				[ 'traffic' ]: selectedPageModules,
			} )
		);
	};

	return (
		<div className="page-modules-settings">
			<button
				className="page-modules-settings-action"
				ref={ buttonRefCallback }
				onClick={ toggleSettingsMenu }
			>
				{ customToggleIcon }
			</button>
			<Popover
				className="tooltip tooltip--darker highlight-card-tooltip highlight-card__settings-tooltip"
				isVisible={ isTooltipShown }
				position="bottom left"
				context={ settingsActionRef.current }
			>
				<div className="highlight-card-tooltip-content">
					<p>{ translate( 'Here’s where you can find all your Jetpack Stats settings.' ) }</p>
					<button onClick={ onTooltipDismiss }>{ translate( 'Got it' ) }</button>
				</div>
			</Popover>
			<Popover
				className="tooltip highlight-card-popover page-modules-settings-popover"
				isVisible={ isSettingsMenuVisible }
				position="bottom left"
				context={ settingsActionRef.current }
				focusOnShow={ false }
				onClose={ () => {
					setIsSettingsMenuVisible( false );
				} }
			>
				<div>{ translate( 'Modules visibility' ) }</div>
				<div className="page-modules-settings-toggle-wrapper">
					{ availableModuleToggles.map( ( toggleItem: ModuleToggleItem ) => {
						return (
							<div key={ toggleItem.key } className="page-modules-settings-toggle">
								<Icon className="gridicon" icon={ toggleItem.icon } />
								<span>{ toggleItem.label }</span>
								<FormToggle
									className="page-modules-settings-toggle-control"
									checked={ pageModules[ toggleItem.key ] ?? toggleItem.defaultValue }
									onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) => {
										onToggleModule( toggleItem.key, event.target.checked );
									} }
								/>
							</div>
						);
					} ) }
				</div>
			</Popover>
		</div>
	);
}
