import { Popover } from '@automattic/components';
import { FormToggle } from '@wordpress/components';
import { Icon, cog } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef, useCallback } from 'react';
import { ModuleToggleItem } from './constants';

type PageModuleTogglerProps = {
	availableModuleToggles: ModuleToggleItem[];
	pageModules: { [ name: string ]: boolean };
	onToggleModule: ( module: string, isShow: boolean ) => void;
	isTooltipShown: boolean;
	onTooltipDismiss: () => void;
};

export default function PageModuleToggler( {
	availableModuleToggles,
	pageModules,
	onToggleModule,
	isTooltipShown,
	onTooltipDismiss,
}: PageModuleTogglerProps ) {
	const translate = useTranslate();

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

	return (
		<div className="page-modules-settings">
			<button
				className="page-modules-settings-action"
				ref={ buttonRefCallback }
				onClick={ toggleSettingsMenu }
			>
				<Icon className="gridicon" icon={ cog } />
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
									checked={
										toggleItem.disabled === false && pageModules[ toggleItem.key ] !== false
									}
									disabled={ toggleItem.disabled }
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
