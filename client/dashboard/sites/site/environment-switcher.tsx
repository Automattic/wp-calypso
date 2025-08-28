import { useQuery, useMutation } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	Button,
	Dropdown,
	MenuGroup,
	MenuItem,
	Spinner,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { sprintf, __ } from '@wordpress/i18n';
import { Icon, chevronDownSmall, plus } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { siteByIdQuery } from '../../app/queries/site';
import { stagingSiteCreateMutation } from '../../app/queries/site-staging-sites';
import { production, staging } from '../../components/icons';
import RouterLinkMenuItem from '../../components/router-link-menu-item';
import { hasStagingSite } from '../../utils/site-staging-site';
import { canManageSite, canCreateStagingSite } from '../features';
import type { Site } from '../../data/types';

type EnvironmentType = 'production' | 'staging';

const Environment = ( { env }: { env: EnvironmentType } ) => {
	if ( env === 'staging' ) {
		return (
			<HStack justify="flex-start" style={ { width: 'auto', flexShrink: 0 } }>
				<Icon icon={ staging } />
				<span>{ __( 'Staging' ) }</span>
			</HStack>
		);
	}

	return (
		<HStack justify="flex-start" style={ { width: 'auto', flexShrink: 0 } }>
			<Icon icon={ production } />
			<span>{ __( 'Production' ) }</span>
		</HStack>
	);
};

const CurrentEnvironment = ( { site }: { site: Site } ) => {
	if ( site.is_wpcom_staging_site ) {
		return <Environment env="staging" />;
	}

	return <Environment env="production" />;
};

const EnvironmentSwitcherDropdown = ( {
	currentSite,
	otherEnvironment,
	otherEnvironmentSite,
	onClose,
}: {
	currentSite: Site;
	otherEnvironment: EnvironmentType;
	otherEnvironmentSite?: Site;
	onClose: () => void;
} ) => {
	const productionSite = otherEnvironment === 'staging' ? currentSite : otherEnvironmentSite;
	const stagingSite = otherEnvironment === 'staging' ? otherEnvironmentSite : currentSite;
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const mutation = useMutation( stagingSiteCreateMutation( productionSite?.ID ?? 0 ) );
	const handleCreate = () => {
		mutation.mutate( undefined, {
			onSuccess: () => {
				createSuccessNotice( __( 'Staging site created.' ), { type: 'snackbar' } );
			},
			onError: ( error: Error ) => {
				createErrorNotice(
					sprintf(
						// translators: "reason" is why adding the staging site failed.
						__( 'Failed to create staging site: %(reason)s' ),
						{ reason: error.message }
					),
					{
						type: 'snackbar',
					}
				);
			},
		} );
	};

	// TODO: Handle upsell.
	const handleUpsell = () => {};

	return (
		<MenuGroup>
			{ productionSite && canManageSite( productionSite ) && (
				<RouterLinkMenuItem to={ `/sites/${ productionSite.slug }` } onClick={ onClose }>
					<Environment env="production" />
				</RouterLinkMenuItem>
			) }
			{ stagingSite && canManageSite( stagingSite ) && (
				<RouterLinkMenuItem to={ `/sites/${ stagingSite.slug }` } onClick={ onClose }>
					<Environment env="staging" />
				</RouterLinkMenuItem>
			) }
			{ otherEnvironment === 'staging' && productionSite && ! stagingSite && (
				<MenuItem onClick={ canCreateStagingSite( productionSite ) ? handleCreate : handleUpsell }>
					<HStack justify="flex-start">
						{ mutation.isPending ? (
							<>
								<Spinner style={ { width: '24px', height: '24px', padding: '4px', margin: 0 } } />
								<span>{ __( 'Creating staging site…' ) }</span>
							</>
						) : (
							<>
								<Icon icon={ plus } />
								<span>{ __( 'Add staging site' ) }</span>
							</>
						) }
					</HStack>
				</MenuItem>
			) }
		</MenuGroup>
	);
};

const EnvironmentSwitcher = ( { site }: { site: Site } ) => {
	const otherEnvironment = site.is_wpcom_staging_site ? 'production' : 'staging';
	const otherEnvironmentSiteId = site.is_wpcom_staging_site
		? site.options?.wpcom_production_blog_id
		: site.options?.wpcom_staging_blog_ids?.[ 0 ];

	const { data: otherEnvironmentSite } = useQuery( {
		...siteByIdQuery( otherEnvironmentSiteId ?? 0 ),
		enabled: !! otherEnvironmentSiteId,
	} );

	return (
		<HStack style={ { width: 'auto', flexShrink: 0 } }>
			<Dropdown
				renderToggle={ ( { onToggle } ) => {
					const canToggle =
						hasStagingSite( site ) ||
						( otherEnvironmentSite && canManageSite( otherEnvironmentSite ) );

					return (
						<Button
							className="dashboard-menu__item active"
							icon={ canToggle ? chevronDownSmall : null }
							iconPosition="right"
							disabled={ ! canToggle }
							onClick={ onToggle }
						>
							<CurrentEnvironment site={ site } />
						</Button>
					);
				} }
				renderContent={ ( { onClose } ) => (
					<EnvironmentSwitcherDropdown
						currentSite={ site }
						otherEnvironment={ otherEnvironment }
						otherEnvironmentSite={ otherEnvironmentSite }
						onClose={ onClose }
					/>
				) }
			/>
		</HStack>
	);
};

export default EnvironmentSwitcher;
