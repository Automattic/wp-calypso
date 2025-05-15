import Menu from '../../components/menu';
import { useAppContext } from '../context';
import { sitesRoute, domainsRoute, emailsRoute, siteOverviewRoute } from '../router';

function PrimaryMenu() {
	const { supports } = useAppContext();

	return (
		<Menu>
			{ supports.overview && (
				<Menu.Item to={ siteOverviewRoute.to }>
					{ siteOverviewRoute.options.staticData.label() }
				</Menu.Item>
			) }
			{ supports.sites && (
				<Menu.Item to={ sitesRoute.to }>{ sitesRoute.options.staticData.label() }</Menu.Item>
			) }
			{ supports.domains && (
				<Menu.Item to={ domainsRoute.to }>{ domainsRoute.options.staticData.label() }</Menu.Item>
			) }
			{ supports.emails && (
				<Menu.Item to={ emailsRoute.to }>{ emailsRoute.options.staticData.label() }</Menu.Item>
			) }
		</Menu>
	);
}

export default PrimaryMenu;
