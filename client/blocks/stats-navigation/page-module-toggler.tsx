import { Popover } from '@automattic/components';
import { FormToggle } from '@wordpress/components';
import { Icon, cog } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef, ReactElement } from 'react';

type PageModuleTogglerProps = {
	availableModules: ModuleToggleItem[];
	pageModules: { [ name: string ]: boolean };
	onToggleModule: ( module: string, isShow: boolean ) => void;
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
}: PageModuleTogglerProps ) {
	const translate = useTranslate();
	const settingsActionRef = useRef( null );
	const [ isPageSettingsPopoverVisible, setIsPageSettingsPopoverVisible ] = useState( false );

	return (
		<div className="page-modules-settings">
			<button
				className="page-modules-settings-action"
				ref={ settingsActionRef }
				onClick={ () => {
					setIsPageSettingsPopoverVisible( ! isPageSettingsPopoverVisible );
				} }
			>
				<Icon className="gridicon" icon={ cog } />
			</button>
			<Popover
				className="tooltip highlight-card-popover page-modules-settings-popover"
				isVisible={ isPageSettingsPopoverVisible }
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
