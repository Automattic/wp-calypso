import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet, notFound } from '@tanstack/react-router';
import { __experimentalHStack as HStack, Icon } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { globe } from '@wordpress/icons';
import { domainsQuery } from '../../app/queries/domains';
import { domainRoute } from '../../app/router';
import HeaderBar from '../../components/header-bar';
import MenuDivider from '../../components/menu-divider';
import Switcher from '../../components/switcher';
import DomainMenu from '../domain-menu';

import './style.scss';

function Domain() {
	const isDesktop = useViewportMatch( 'medium' );
	const { domainName } = domainRoute.useParams();
	const { data: domains } = useSuspenseQuery( domainsQuery() );
	const domain = domains.find( ( domain ) => domain.domain === domainName );

	if ( ! domain ) {
		throw notFound();
	}

	return (
		<>
			<HeaderBar>
				<HStack justify={ isDesktop ? 'flex-start' : 'space-between' } spacing={ 3 }>
					<HeaderBar.Title>
						<Switcher
							items={ domains }
							value={ domain }
							getItemName={ ( domain ) => domain.domain }
							getItemUrl={ ( domain ) => `/domains/${ domain.domain }` }
							renderItemIcon={ ( { context } ) =>
								context === 'list' ? null : (
									<Icon className="domain-icon" icon={ globe } size={ 24 } />
								)
							}
						/>
					</HeaderBar.Title>
					{ isDesktop && <MenuDivider /> }
					<DomainMenu domainName={ domain.domain } />
				</HStack>
			</HeaderBar>
			<Outlet />
		</>
	);
}

export default Domain;
