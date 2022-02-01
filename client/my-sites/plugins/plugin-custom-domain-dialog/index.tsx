import { Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PluginIcon from '../plugin-icon/plugin-icon';

interface Props {
	plugin: { name: string; icon: string };
	domains: Array< { isPrimary: boolean; isSubdomain: boolean } >;
	closeDialog: () => void;
	isDialogVisible: boolean;
}

export const PluginCustomDomainDialog = ( {
	plugin,
	domains,
	closeDialog,
	isDialogVisible,
}: Props ): JSX.Element => {
	const translate = useTranslate();

	const hasNonPrimaryCustomDomain = domains.some(
		( { isPrimary, isSubdomain } ) => ! isPrimary && ! isSubdomain
	);

	return (
		<Dialog
			additionalClassNames={ 'plugin-custom-domain-dialog__content' }
			isVisible={ isDialogVisible }
			onClose={ closeDialog }
		>
			<div>
				<PluginIcon image={ plugin.icon } />
				<p>
					{ hasNonPrimaryCustomDomain
						? translate(
								'%(pluginName)s will help you optimize your site around your primary domain. We recommend setting your custom domain as your primary before installing.',
								{
									args: { pluginName: plugin.name },
								}
						  )
						: translate(
								'%(pluginName)s will help you optimize your site around your primary domain. We recommend adding a custom domain before installing.',
								{
									args: { pluginName: plugin.name },
								}
						  ) }
				</p>
			</div>
		</Dialog>
	);
};
