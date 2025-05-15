import { DropdownMenu } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { menu } from '@wordpress/icons';
import RouterLinkMenuItem from '../../components/router-link-menu-item';
import { useAppContext } from '../context';
import { sitesRoute, domainsRoute, emailsRoute, siteOverviewRoute } from '../router';

function PrimaryMenuMobile() {
	const { supports } = useAppContext();

	return (
		<DropdownMenu
			icon={ menu }
			label={ __( 'Main Menu' ) }
			popoverProps={ {
				placement: 'bottom-end',
			} }
		>
			{ ( { onClose } ) => (
				<>
					{ supports.overview && (
						<RouterLinkMenuItem to={ siteOverviewRoute.to } onClick={ onClose }>
							{ siteOverviewRoute.options.staticData.label() }
						</RouterLinkMenuItem>
					) }
					{ supports.sites && (
						<RouterLinkMenuItem to={ sitesRoute.to }>
							{ sitesRoute.options.staticData.label() }
						</RouterLinkMenuItem>
					) }
					{ supports.domains && (
						<RouterLinkMenuItem to={ domainsRoute.to }>
							{ domainsRoute.options.staticData.label() }
						</RouterLinkMenuItem>
					) }
					{ supports.emails && (
						<RouterLinkMenuItem to={ emailsRoute.to }>
							{ emailsRoute.options.staticData.label() }
						</RouterLinkMenuItem>
					) }
				</>
			) }
		</DropdownMenu>
	);
}

export default PrimaryMenuMobile;
