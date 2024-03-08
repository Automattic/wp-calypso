import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { JETPACK_DASHBOARD_GET_HELP_NAV_PREFERENCE } from 'calypso/state/jetpack-agency-dashboard/selectors';
import FoldableNav from '../../foldable-nav';
import { FoldableNavItem } from '../../foldable-nav/types';

export default function GetHelpNav() {
	const translate = useTranslate();

	const header = translate( 'Get help' );
	const tracksName = 'calypso_jetpack_manage_overview_get_help';

	const navItems: FoldableNavItem[] = [
		{
			link: localizeUrl( 'https://jetpack.com/support/jetpack-manage-instructions/' ),
			slug: 'kb_getting_started',
			title: translate( 'Get started guide' ),
		},
		{
			link: localizeUrl(
				'https://jetpack.com/support/jetpack-manage-instructions/jetpack-manage-dashboard/'
			),
			slug: 'kb_site_management',
			title: translate( 'All sites management' ),
		},
		{
			link: localizeUrl(
				'https://jetpack.com/support/jetpack-manage-instructions/jetpack-manage-licensing/'
			),
			slug: 'kb_licenses',
			title: translate( 'Issuing, assigning, and revoking licenses' ),
		},
		{
			link: localizeUrl(
				'https://jetpack.com/support/jetpack-manage-instructions/jetpack-manage-issuing-assigning-and-revoking-licenses/'
			),
			slug: 'kb_billing_faqs',
			title: translate( 'Billing/payment FAQs' ),
		},
		{
			link: localizeUrl(
				'https://jetpack.com/support/jetpack-manage-instructions/jetpack-manage-managing-plugins/'
			),
			slug: 'kb_plugin_management',
			title: translate( 'Managing plugins' ),
			isExternalLink: true,
		},
	].map( ( props ) => ( {
		isExternalLink: true,
		...props,
		trackEventName: 'calypso_jetpack_manage_overview_get_help_click',
	} ) );

	return (
		<FoldableNav
			header={ header }
			navItems={ navItems }
			preferenceName={ JETPACK_DASHBOARD_GET_HELP_NAV_PREFERENCE }
			tracksName={ tracksName }
		/>
	);
}
