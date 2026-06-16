import { userSitesQuery, userPreferenceQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	Card,
	CardHeader,
	CardBody,
	Button,
	ToggleControl,
	Notice,
	Spinner,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { SiteIcon } from 'calypso/blocks/site-icon';
import { decodeEntities } from 'calypso/lib/formatting';
import { withoutHttp } from 'calypso/lib/url';
import { useSetHiddenSites } from 'calypso/reader/data/user-profile';

interface SitesVisibilityCardProps {
	userId: number;
	sitesEnabled: boolean;
}

export default function SitesVisibilityCard( {
	userId,
	sitesEnabled,
}: SitesVisibilityCardProps ): JSX.Element | null {
	const translate = useTranslate();

	const { data: sitesData, isLoading } = useQuery( userSitesQuery( userId, { owner: true } ) );
	const { data: hiddenSites = [] } = useQuery(
		userPreferenceQuery( 'reader-profile-hidden-sites' )
	);
	const { setSiteHidden, setAllHidden, pendingSiteId, isPending } =
		useSetHiddenSites( hiddenSites );

	const sites = sitesData?.sites ?? [];
	const allSiteIds = sites.map( ( site ) => site.ID );
	const allVisible = allSiteIds.every( ( id ) => ! hiddenSites.includes( id ) );

	if ( ! isLoading && sites.length === 0 ) {
		return null;
	}

	return (
		<Card>
			<CardHeader>
				<h2 className="user-profile-settings__card-title">{ translate( 'Sites' ) }</h2>
				<Button
					variant="link"
					disabled={ ! sitesEnabled || isPending }
					onClick={ () => setAllHidden( allVisible, allSiteIds ) }
				>
					{ allVisible ? translate( 'Deselect all' ) : translate( 'Select all' ) }
				</Button>
			</CardHeader>
			<CardBody>
				<VStack spacing={ 4 }>
					{ ! sitesEnabled && (
						<Notice status="info" isDismissible={ false }>
							{ translate( 'Turn on the Sites tab to choose which sites are visible.' ) }
						</Notice>
					) }
					{ isLoading ? (
						<Spinner />
					) : (
						sites.map( ( site ) => {
							const isHidden = hiddenSites.includes( site.ID );
							const image = site.icon?.img || site.icon?.ico;
							// Fall back to the site URL when the site has no title.
							const siteLabel = site.name?.trim()
								? decodeEntities( site.name )
								: withoutHttp( site.URL );
							return (
								<HStack key={ site.ID } justify="space-between" spacing={ 3 }>
									<HStack justify="flex-start" spacing={ 3 } expanded={ false }>
										<SiteIcon siteId={ site.ID } iconUrl={ image } size={ 24 } />
										<span>{ siteLabel }</span>
									</HStack>
									<HStack justify="flex-end" spacing={ 2 } expanded={ false }>
										{ pendingSiteId === site.ID && <Spinner /> }
										<ToggleControl
											__nextHasNoMarginBottom
											checked={ ! isHidden }
											disabled={ ! sitesEnabled || isPending }
											onChange={ ( checked ) => setSiteHidden( site.ID, ! checked ) }
											label={ translate( 'Visible on profile' ) }
										/>
									</HStack>
								</HStack>
							);
						} )
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}
