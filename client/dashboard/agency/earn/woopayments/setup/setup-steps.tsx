import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ActionList } from '../../../../components/action-list';
import Notice from '../../../../components/notice';

interface SetupStepsProps {
	wpAdminInstallUrl: string;
	isWooPaymentsActive: boolean;
	isInstalled: boolean;
	isInstalling: boolean;
	hasError: boolean;
	onInstallClick: () => void;
	onVisitWpAdminClick: () => void;
	onViewCommissionsClick: () => void;
}

const installInstruction = __(
	"Click the button and we'll automatically install and activate the plugin for you. Then we'll launch WP-Admin so you can configure the final steps."
);

export default function SetupSteps( {
	wpAdminInstallUrl,
	isWooPaymentsActive,
	isInstalled,
	isInstalling,
	hasError,
	onInstallClick,
	onVisitWpAdminClick,
	onViewCommissionsClick,
}: SetupStepsProps ) {
	return (
		<VStack spacing={ 6 }>
			{ hasError && (
				<Notice variant="error">
					<Text>
						{ __(
							"We're sorry, we weren't able to install WooPayments on your site. Visit your WP-Admin to set up."
						) }
					</Text>
				</Notice>
			) }
			<ActionList title={ __( 'Next steps' ) }>
				<ActionList.ActionItem
					layout="stacked"
					title={ __( 'Install and activate the plugin on WP-Admin' ) }
					description={ installInstruction }
					actions={
						hasError ? (
							<Button
								variant="primary"
								href={ wpAdminInstallUrl }
								target="_blank"
								rel="noopener noreferrer"
								onClick={ onVisitWpAdminClick }
							>
								{ __( 'Visit WP-Admin ↗' ) }
							</Button>
						) : (
							<Button
								variant="primary"
								disabled={ isInstalling }
								isBusy={ isInstalling }
								onClick={ onInstallClick }
							>
								{ isInstalled || isWooPaymentsActive
									? __( 'Finish setup ↗' )
									: __( 'Install and activate the plugin ↗' ) }
							</Button>
						)
					}
				/>
				<ActionList.ActionItem
					layout="stacked"
					title={ __( 'Earn commissions' ) }
					description={ __(
						"Once the plugin is installed and configured, each time a transaction occurs, you'll earn commisions!"
					) }
					actions={
						<Button variant="secondary" onClick={ onViewCommissionsClick }>
							{ __( 'View WooPayments commissions' ) }
						</Button>
					}
				/>
			</ActionList>
		</VStack>
	);
}
