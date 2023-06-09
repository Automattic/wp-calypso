import { Popover } from '@automattic/components';
import { FormToggle } from '@wordpress/components';
import { Icon, cog } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef, ReactElement } from 'react';

type PageModuleTogglerProps = {
	availableModules: ModuleToggleItem[];
	pageModules: { [ name: string ]: boolean };
	onToggleModule: ( module: string, isShow: boolean ) => void;
	isTooltipShown: boolean;
	onTooltipDismiss: () => void;
};

type ModuleToggleItem = {
	label: string;
	key: string;
	icon: ReactElement;
	defaultValue: boolean;
};

export default function PageModuleToggler( {
	availableModules,
	pageModules,
	onToggleModule,
	isTooltipShown,
	onTooltipDismiss,
}: PageModuleTogglerProps ) {
	const translate = useTranslate();
	const settingsActionRef = useRef( null );
	const [ isSettingsMenuVisible, setIsSettingsMenuVisible ] = useState( false );

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
				ref={ settingsActionRef }
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
			>
				<div>{ translate( 'Modules visibility' ) }</div>
				<div className="page-modules-settings-toggle-wrapper">
					{ availableModules.map( ( toggleItem: ModuleToggleItem ) => {
						return (
							<div key={ toggleItem.key } className="page-modules-settings-toggle">
								<Icon className="gridicon" icon={ toggleItem.icon } />
								<span>{ toggleItem.label }</span>
								<FormToggle
									className="page-modules-settings-toggle-control"
									checked={ pageModules[ toggleItem.key ] !== false }
									onChange={ ( event: React.FormEvent< HTMLInputElement > ) => {
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
