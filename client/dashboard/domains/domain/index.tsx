import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet, notFound } from '@tanstack/react-router';
import { __experimentalHStack as HStack, Dropdown, Button, Icon } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { chevronDownSmall, globe } from '@wordpress/icons';
import { domainsQuery } from '../../app/queries/domains';
import { domainRoute } from '../../app/router';
import HeaderBar from '../../components/header-bar';
import MenuDivider from '../../components/menu-divider';
import DomainMenu from '../domain-menu';
import Switcher from './switcher';

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
						<Dropdown
							renderToggle={ ( { onToggle } ) => (
								<Button
									className="dashboard-menu__item active"
									icon={ chevronDownSmall }
									iconPosition="right"
									onClick={ () => onToggle() }
								>
									<div style={ { display: 'flex', gap: '8px', alignItems: 'center' } }>
										<Icon icon={ globe } size={ 16 } /> { domain.domain }
									</div>
								</Button>
							) }
							renderContent={ ( { onClose } ) => <Switcher onClose={ onClose } /> }
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
