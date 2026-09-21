import page from '@automattic/calypso-router';
import { Card, CardBody, ToggleControl } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { useEffect, type ReactNode } from 'react';
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
} from '../../hooks/use-stats-settings';
import PageViewTracker from '../../stats-page-view-tracker';
import PageLoading from '../shared/page-loading';
import canManageStatsSettings from './can-manage-stats-settings';
import './style.scss';

type RoleField = 'roles' | 'count_roles';

// Shared by the success and error notices, so each save replaces the last notice instead of stacking.
const SAVE_NOTICE_ID = 'stats-settings-save';

type SettingsCardProps = {
	title: ReactNode;
	description?: ReactNode;
	children: ReactNode;
};

function SettingsCard( { title, description, children }: SettingsCardProps ) {
	return (
		<Card>
			<CardBody className="stats-settings__section">
				<h2 className="stats-settings__title">{ title }</h2>
				{ description && <p className="stats-settings__description">{ description }</p> }
				{ children }
			</CardBody>
		</Card>
	);
}

function StatsSettingsPage() {
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const canManage = useSelector( ( state ) => canManageStatsSettings( state, siteId ) );
	const { data, isError } = useStatsSettingsQuery( canManage ? siteId : null );
	const { mutate } = useStatsSettingsMutation( siteId );

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
			onSuccess: () =>
				dispatch(
					successNotice( translate( 'Settings saved.' ), {
						id: SAVE_NOTICE_ID,
						duration: 5000,
					} )
				),
			onError: () =>
				dispatch(
					errorNotice( translate( 'Your Stats settings could not be saved.' ), {
						id: SAVE_NOTICE_ID,
					} )
				),
		} );

	const toggleRole = ( field: RoleField, role: string, isOn: boolean ) => {
		const current = data?.settings[ field ] ?? [];
		save( {
			[ field ]: isOn ? [ ...current, role ] : current.filter( ( slug ) => slug !== role ),
		} );
	};

	const renderRoleToggles = ( field: RoleField ) =>
		data?.roles.map( ( { slug, name } ) => {
			// Administrators always see Stats, so their toggle only shows that.
			const isLockedOn = 'roles' === field && 'administrator' === slug;
			return (
				<ToggleControl
					__nextHasNoMarginBottom
					key={ slug }
					label={ name }
					checked={ isLockedOn || data.settings[ field ].includes( slug ) }
					disabled={ isLockedOn }
					onChange={ ( isOn ) => toggleRole( field, slug, isOn ) }
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
					{ isError && (
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
									onChange={ ( isOn ) => save( { admin_bar: isOn } ) }
								/>
							</SettingsCard>
							<SettingsCard
								title={ translate( 'Logged-in views' ) }
								description={ translate(
									'Count page views from logged-in users with these roles.'
								) }
							>
								{ renderRoleToggles( 'count_roles' ) }
							</SettingsCard>
							<SettingsCard
								title={ translate( 'Stats access' ) }
								description={ translate(
									'Let users with these roles view your Stats. Administrators can always view them.'
								) }
							>
								{ renderRoleToggles( 'roles' ) }
							</SettingsCard>
							<SettingsCard title={ translate( 'WordPress.com Reader' ) }>
								<ToggleControl
									__nextHasNoMarginBottom
									label={ translate( 'Show post views for this site.' ) }
									checked={ data.settings.wpcom_reader_views_enabled }
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
