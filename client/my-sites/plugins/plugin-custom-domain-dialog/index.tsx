import { Dialog } from '@automattic/components';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
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
}: Props ) => {
	const translate = useTranslate();
	const localizeUrl = useLocalizeUrl();

	const selectedSiteUrl = useSelector( getSelectedSiteSlug );

	const hasNonPrimaryCustomDomain = domains.some(
		( { isPrimary, isSubdomain } ) => ! isPrimary && ! isSubdomain
	);

	const buttons = [
		{
			action: 'learn-more',
			href: localizeUrl( 'https://wordpress.com/support/domains/#set-a-primary-address' ),
			label: translate( 'Learn more' ),
		},
		{
			action: 'manage-domains',
			href: '/domains/manage/' + selectedSiteUrl,
			label: translate( 'Manage domains' ),
		},
		{
			className: 'plugin-custom-domain-dialog__install_plugin',
			action: 'install-plugin',
			label: translate( 'Install' ),
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
								'{{pluginName/}} will help you optimize your site around your primary domain. We recommend setting your custom domain as your primary before installing.',
								{
									components: { pluginName: <strong>{ plugin.name }</strong> },
								}
						  )
						: translate(
								'{{pluginName/}} will help you optimize your site around your primary domain. We recommend adding a custom domain before installing.',
								{
									components: { pluginName: <strong>{ plugin.name }</strong> },
								}
						  ) }
				</div>
			</div>
		</Dialog>
	);
};
