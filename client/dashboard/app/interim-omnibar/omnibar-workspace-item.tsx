import { __ } from '@wordpress/i18n';
import { check, chevronRightSmall, Icon } from '@wordpress/icons';
import { setWorkspace, useWorkspace } from '../workspace';
import type { Workspace } from '../workspace';

interface WorkspaceOption {
	value: Workspace;
	label: string;
	description: string;
}

/**
 * "Workspace" entry for the Howdy menu, with a wp-admin style nested flyout
 * to switch between the Essential and Advanced dashboard workspaces.
 */
export function OmnibarWorkspaceItem() {
	const workspace = useWorkspace();
	const options: WorkspaceOption[] = [
		{
			value: 'essential',
			label: __( 'Essential' ),
			description: __( 'For bloggers and creators' ),
		},
		{
			value: 'advanced',
			label: __( 'Advanced' ),
			description: __( 'For developers and agencies' ),
		},
		{
			value: 'commerce',
			label: __( 'Commerce' ),
			description: __( 'For e-commerce stores and Woo' ),
		},
	];
	const current = options.find( ( option ) => option.value === workspace );

	return (
		<div className="omnibar-workspace">
			<div className="omnibar-workspace__row">
				<span>{ __( 'Workspace' ) }</span>
				<span className="omnibar-workspace__current">
					{ current?.label }
					<Icon icon={ chevronRightSmall } size={ 18 } />
				</span>
			</div>
			<ul className="omnibar-workspace__submenu">
				{ options.map( ( option ) => (
					<li key={ option.value }>
						<button
							type="button"
							aria-current={ workspace === option.value ? 'true' : undefined }
							onClick={ () => setWorkspace( option.value ) }
						>
							<span className="omnibar-workspace__option-check">
								{ workspace === option.value && <Icon icon={ check } size={ 18 } /> }
							</span>
							<span className="omnibar-workspace__option-text">
								<span className="omnibar-workspace__option-label">{ option.label }</span>
								<span className="omnibar-workspace__option-description">
									{ option.description }
								</span>
							</span>
						</button>
					</li>
				) ) }
			</ul>
		</div>
	);
}
