import page from '@automattic/calypso-router';
import {
	Card,
	CardBody,
	__experimentalHeading as Heading,
	ToggleControl,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useId, useState, type ReactNode } from 'react';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/my-sites/stats/components/stats-main';
import { STATS_PRODUCT_NAME } from 'calypso/my-sites/stats/constants';
import { useDispatch, useSelector } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import {
	useStatsSettingsMutation,
	useStatsSettingsQuery,
	type StatsSettings,
	type StatsSettingsResponse,
} from '../../hooks/use-stats-settings';
import PageViewTracker from '../../stats-page-view-tracker';
import PageLoading from '../shared/page-loading';
import canManageStatsSettings from './can-manage-stats-settings';
import reloadPage from './reload-page';
import { showSavedNoticeAfterReload, takeSavedNoticeRequest } from './saved-notice-after-reload';
import './style.scss';

type RoleField = 'roles' | 'count_roles';

// Shared by the success and error notices, so each save replaces the last notice instead of stacking.
const SAVE_NOTICE_ID = 'stats-settings-save';

const savedNotice = ( translate: ReturnType< typeof useTranslate > ) =>
	successNotice( translate( 'Settings saved.' ), { id: SAVE_NOTICE_ID, duration: 5000 } );

// The request layer copies the site's REST error body onto the error, so a string `code` marks a message the site wrote.
const getSiteErrorMessage = ( error: unknown ) =>
	error instanceof Error && typeof ( error as Error & { code?: unknown } ).code === 'string'
		? error.message
		: null;

type SettingsCardProps = {
	title: ReactNode;
	description?: ReactNode;
	children: ReactNode;
};

function SettingsCard( { title, description, children }: SettingsCardProps ) {
	const headingId = useId();

	return (
		<Card>
			<CardBody className="stats-settings__section" role="group" aria-labelledby={ headingId }>
				<Heading id={ headingId } level={ 2 } size={ 16 }>
					{ title }
				</Heading>
				{ description && <p className="stats-settings__description">{ description }</p> }
				{ children }
			</CardBody>
		</Card>
	);
}

function StatsSettingsPage() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const canManage = useSelector( ( state ) => canManageStatsSettings( state, siteId ) );
	const { data, isError } = useStatsSettingsQuery( canManage ? siteId : null );
	// One save at a time: overlapping saves can finish out of order and keep an older role list.
	const { mutate, isPending: isSaving } = useStatsSettingsMutation( siteId );
	// The page keeps running until the reload replaces it, and a save sent then would be lost.
	const [ isReloading, setIsReloading ] = useState( false );
	const isBusy = isSaving || isReloading;

	useEffect( () => {
		if ( takeSavedNoticeRequest() ) {
			dispatch( savedNotice( translate ) );
		}
	}, [ dispatch, translate ] );

	useEffect( () => {
		if ( siteSlug && ! canManage ) {
			page.redirect( `/stats/day/${ siteSlug }` );
		}
	}, [ canManage, siteSlug ] );

	if ( ! canManage ) {
		return null;
	}

	const save = ( values: Partial< StatsSettings > ) =>
		mutate( values, {
			onSuccess: () => {
				// The server draws the admin bar, so its chart changes only on a page load.
				if ( 'admin_bar' in values ) {
					setIsReloading( true );
					showSavedNoticeAfterReload();
					reloadPage();
					return;
				}
				dispatch( savedNotice( translate ) );
			},
			onError: ( error ) => {
				const reason = getSiteErrorMessage( error );
				dispatch(
					errorNotice(
						reason
							? translate( 'Your Stats settings could not be saved: %(reason)s', {
									args: { reason },
								} )
							: translate( 'Your Stats settings could not be saved.' ),
						{ id: SAVE_NOTICE_ID }
					)
				);
			},
		} );

	const renderRoleToggles = ( { roles, settings }: StatsSettingsResponse, field: RoleField ) =>
		roles.map( ( { slug, name } ) => {
			const isLockedOn = 'roles' === field && 'administrator' === slug;
			const current = settings[ field ];
			return (
				<ToggleControl
					__nextHasNoMarginBottom
					key={ slug }
					label={ name }
					checked={ isLockedOn || current.includes( slug ) }
					disabled={ isLockedOn || isBusy }
					onChange={ ( isOn ) =>
						save( {
							[ field ]: isOn ? [ ...current, slug ] : current.filter( ( role ) => role !== slug ),
						} )
					}
				/>
			);
		} );

	return (
		<Main
			fullWidthLayout
			pageSubTitle={ translate( 'Simple, powerful analytics to grow your site.' ) }
			pageTabs={ <StatsNavigation selectedItem="settings" siteId={ siteId } slug={ siteSlug } /> }
		>
			<DocumentHead title={ STATS_PRODUCT_NAME } />
			<PageViewTracker path="/stats/settings/:site" title="Stats > Settings" />
			<div className="stats stats-settings">
				<div className="stats-settings__content">
					{ isError && ! data && (
						<p>
							{ translate(
								'Your Stats settings could not be loaded. Reload the page to try again.'
							) }
						</p>
					) }
					{ ! data && ! isError && PageLoading }
					{ data && (
						<>
							<SettingsCard title={ translate( 'Admin bar' ) }>
								<ToggleControl
									__nextHasNoMarginBottom
									label={ translate( 'Put a chart showing 48 hours of views in the admin bar' ) }
									checked={ data.settings.admin_bar }
									disabled={ isBusy }
									onChange={ ( isOn ) => save( { admin_bar: isOn } ) }
								/>
							</SettingsCard>
							<SettingsCard
								title={ translate( 'Logged-in views' ) }
								description={ translate(
									'Count page views from logged-in users with these roles.'
								) }
							>
								{ renderRoleToggles( data, 'count_roles' ) }
							</SettingsCard>
							<SettingsCard
								title={ translate( 'Stats access' ) }
								description={ translate(
									'Let users with these roles view your Stats. Administrators can always view them.'
								) }
							>
								{ renderRoleToggles( data, 'roles' ) }
							</SettingsCard>
							<SettingsCard title={ translate( 'WordPress.com Reader' ) }>
								<ToggleControl
									__nextHasNoMarginBottom
									label={ translate( 'Show post views for this site.' ) }
									checked={ data.settings.wpcom_reader_views_enabled }
									disabled={ isBusy }
									onChange={ ( isOn ) => save( { wpcom_reader_views_enabled: isOn } ) }
								/>
							</SettingsCard>
						</>
					) }
				</div>
			</div>
		</Main>
	);
}

export default StatsSettingsPage;
