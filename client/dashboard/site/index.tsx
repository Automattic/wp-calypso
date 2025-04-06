import { useLoaderData, Outlet } from '@tanstack/react-router';
import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import HeaderBar from '../header-bar';
import SiteMenu from '../site-menu';

function Site() {
	const { site } = useLoaderData( { from: '/sites/$siteId' } );

	return (
		<>
			<HeaderBar>
				<HStack justify="flex-start" spacing={ 4 }>
					{ site.media && (
						<Button
							variant="tertiary"
							__next40pxDefaultSize
							style={ { flexShrink: 0, color: 'inherit' } }
						>
							<HStack style={ { width: 'auto' } }>
								<img
									src={ site.media }
									alt={ site.name }
									style={ { width: '24px', borderRadius: '2px' } }
								/>
								<span>{ site.name }</span>
							</HStack>
						</Button>
					) }
					<SiteMenu siteId={ site.id } />
				</HStack>
			</HeaderBar>
			<Outlet />
		</>
	);
}

export default Site;
