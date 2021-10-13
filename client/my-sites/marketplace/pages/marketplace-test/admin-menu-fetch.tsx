import { Button, Card } from '@automattic/components';
import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import { level1ObjectMap } from 'calypso/my-sites/marketplace/pages/marketplace-test';
import useSiteMenuItems from 'calypso/my-sites/sidebar-unified/use-site-menu-items';
import { requestAdminMenu } from 'calypso/state/admin-menu/actions';
import { getIsRequestingAdminMenu } from 'calypso/state/admin-menu/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export default function AdminMenuFetch(): JSX.Element {
	const menuItems = useSiteMenuItems();
	const isRequestingMenu = useSelector( getIsRequestingAdminMenu );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const dispatch = useDispatch();

	const { url: postsPageUrl } =
		menuItems.find( ( { slug }: { slug: string } ) => slug === 'edit-php' ) ?? {};

	const { url: yoastSeoPageUrl } =
		menuItems.find( ( { slug }: { slug: string } ) => slug === 'wpseo_dashboard' ) ?? {};

	const fetchAdminMenu = useCallback(
		() => selectedSiteId && dispatch( requestAdminMenu( selectedSiteId ) ),
		[ dispatch, selectedSiteId ]
	);
	useEffect( () => {
		fetchAdminMenu();
	}, [ fetchAdminMenu ] );

	return (
		<Card>
			<Button onClick={ fetchAdminMenu }>Refresh</Button>
			<Card>
				<CardHeading tagName="h1" size={ 21 }>
					Is the menu available?
				</CardHeading>
				{ level1ObjectMap( { isRequestingMenu, postsPageUrl, yoastSeoPageUrl } ).map(
					( { key, value } ) => (
						<div key={ key }>
							{ key } : { value }
						</div>
					)
				) }
			</Card>
		</Card>
	);
}
