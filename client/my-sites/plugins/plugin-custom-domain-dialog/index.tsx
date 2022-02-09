import { Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import PluginIcon from '../plugin-icon/plugin-icon';
import './style.scss';

interface Props {
	plugin: { name: string; icon: string };
	domains: Array< { isPrimary: boolean; isSubdomain: boolean } >;
	closeDialog: () => void;
	isDialogVisible: boolean;
	onProceed: () => void;
}

export const PluginCustomDomainDialog = ( {
	plugin,
	domains,
	closeDialog,
	isDialogVisible,
	onProceed,
}: Props ): JSX.Element => {
	const translate = useTranslate();
	const selectedSiteUrl = useSelector( ( state ) => getSelectedSiteSlug( state ) );

	const hasNonPrimaryCustomDomain = domains.some(
		( { isPrimary, isSubdomain } ) => ! isPrimary && ! isSubdomain
	);

	const buttons = [
		{
			action: 'learn-more',
			label: translate( 'Learn more' ),
		},
		{
			action: 'manage-domains',
			href: '/domains/manage/' + selectedSiteUrl,
			label: translate( 'Manage domains' ),
		},
		{
			action: 'install-plugin',
			label: translate( 'Install %(pluginName)s', {
				args: { pluginName: plugin.name },
			} ),
			isPrimary: true,
			onClick: onProceed,
		},
	];

	return (
		<Dialog isVisible={ isDialogVisible } onClose={ closeDialog } buttons={ buttons }>
			<div className="plugin-custom-domain-dialog__content">
				<div className="plugin-custom-domain-dialog__icon">
					<PluginIcon image={ plugin.icon } />
				</div>
				<div className="plugin-custom-domain-dialog__description">
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
				</div>
			</div>
		</Dialog>
	);
};
