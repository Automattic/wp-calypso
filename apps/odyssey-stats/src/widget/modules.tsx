import { Button } from '@wordpress/components';
import { shield } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState, FunctionComponent } from 'react';
import wpcom from 'calypso/lib/wp';
import useModuleDataQuery from '../hooks/use-module-data-query';
import config, { optionalConfig } from '../lib/config-api';
import canCurrentUser from '../lib/selectors/can-current-user';
import MetricValue from './metric-value';
import { recordWidgetEventThenFollow } from './record-widget-event';
import WidgetSection from './widget-section';
import './modules.scss';

interface ModuleCardProps {
	title: string;
	value: number;
	/** Words the full figure for the metric's tooltip, e.g. "12,345 blocked login attempts". */
	describe: ( formattedValue: string ) => string;
	error: string;
	activateProduct: () => Promise< void >;
	isLoading: boolean;
	isError: boolean;
	canManageModule: boolean;
	className?: string;
	manageUrl?: string;
}

interface ModulesProps {
	siteId: number;
	adminBaseUrl: null | string;
}

const ModuleCard: FunctionComponent< ModuleCardProps > = ( {
	title,
	value,
	describe,
	error,
	activateProduct,
	manageUrl,
	canManageModule,
	isLoading,
	isError,
	className = null,
} ) => {
	const translate = useTranslate();
	const [ disabled, setDisabled ] = useState( false );
	const onActivateProduct = () => {
		setDisabled( true );
		activateProduct().catch( () => setDisabled( false ) );
	};

	// Nothing worth showing: the figure is unknown and the viewer cannot act on it, so a
	// zero would read as a real count.
	if ( isError && ! canManageModule ) {
		return null;
	}

	return (
		<div
			className={ clsx( 'stats-widget-module', 'stats-widget-metric', className ) }
			aria-label={ title }
		>
			<div className="stats-widget-metric__title">{ title }</div>
			{ ( isLoading || ! isError ) && (
				// Zero while loading, so it counts up once the figure lands, as in Overview.
				<MetricValue
					value={ ! isLoading && Number.isFinite( value ) ? value : 0 }
					describe={ describe }
				/>
			) }
			{ ! isLoading && (
				<>
					{ isError && canManageModule && (
						<div className="stats-widget-module__info">
							{ error === 'not_active' && (
								<Button
									variant="primary"
									className="jetpack-emerald-button"
									isBusy={ disabled }
									onClick={ onActivateProduct }
								>
									{ translate( 'Activate' ) }
								</Button>
							) }
							{ error === 'not_installed' && (
								<Button
									variant="secondary"
									className="jetpack-emerald-button"
									isBusy={ disabled }
									onClick={ onActivateProduct }
								>
									{ translate( 'Install' ) }
								</Button>
							) }
							{ error === 'invalid_key' && (
								<a href={ manageUrl } target="_self">
									{ translate( 'Manage Akismet key' ) }
								</a>
							) }
							{ ! [ 'not_active', 'not_installed', 'invalid_key' ].includes( error ) && (
								<p>{ translate( 'An error occurred.' ) }</p>
							) }
						</div>
					) }
				</>
			) }
		</div>
	);
};

const SiteProtection: FunctionComponent< ModulesProps > = ( { siteId, adminBaseUrl } ) => {
	const translate = useTranslate();
	const canManageModules = canCurrentUser( siteId, 'manage_options' );
	const protect = useModuleDataQuery( 'protect' );
	const akismet = useModuleDataQuery( 'akismet' );

	// A card hides itself when its figure failed and the viewer cannot act on it; with
	// both hidden the section would be an empty card.
	if ( protect.isError && akismet.isError && ! canManageModules ) {
		return null;
	}

	const activateProtect = () =>
		wpcom.req
			.post( { path: '/settings', apiNamespace: 'jetpack/v4' }, { protect: true } )
			.then( protect.refetch );

	// Installs the Akismet plugin when it is missing.
	const activateAkismet = () =>
		wpcom.req
			.post( { apiNamespace: 'my-jetpack/v1', path: '/site/products/anti-spam' } )
			.then( akismet.refetch );

	// Registered by the Akismet plugin, so it exists only while Akismet is active.
	const akismetUrl = adminBaseUrl + 'admin.php?page=akismet-key-config';

	// The page needs `manage_options`, while the figure only needs `edit_posts`, so an editor
	// could read the count but not open the page. Waiting for the figure keeps it from flashing.
	const hasAkismetInsights = canManageModules && ! akismet.isError && ! akismet.isPending;

	return (
		<WidgetSection
			title={ translate( 'All-time site protection' ) }
			icon={ shield }
			className="stats-widget-modules"
		>
			<div className="stats-widget-metrics">
				<ModuleCard
					title={ translate( 'Blocked login attempts' ) }
					value={ protect.data as number }
					describe={ ( count ) =>
						translate( '%(count)s blocked login attempt', '%(count)s blocked login attempts', {
							count: protect.data as number,
							args: { count },
						} ) as string
					}
					isError={ protect.isError }
					error={ protect.error instanceof Error ? protect.error.message : '' }
					isLoading={ protect.isPending }
					canManageModule={ canManageModules }
					activateProduct={ activateProtect }
				/>
				<ModuleCard
					title={ translate( 'Blocked spam comments' ) }
					value={ akismet.data as number }
					describe={ ( count ) =>
						translate( '%(count)s blocked spam comment', '%(count)s blocked spam comments', {
							count: akismet.data as number,
							args: { count },
						} ) as string
					}
					isError={ akismet.isError }
					error={ akismet.error instanceof Error ? akismet.error.message : '' }
					isLoading={ akismet.isPending }
					canManageModule={ canManageModules }
					activateProduct={ activateAkismet }
					manageUrl={ akismetUrl }
				/>
			</div>
			{ hasAkismetInsights && (
				<div className="stats-widget-modules__footer">
					<a
						href={ akismetUrl }
						onClick={ recordWidgetEventThenFollow( 'anti_spam_insights_clicked' ) }
					>
						{ translate( 'Anti-spam insights' ) }
					</a>
				</div>
			) }
		</WidgetSection>
	);
};

export default function Modules( { siteId, adminBaseUrl }: ModulesProps ) {
	// Akismet and Protect modules are not available on Simple sites.
	if ( ! config.isEnabled( 'is_running_in_jetpack_site' ) ) {
		return null;
	}

	// Only the Jetpack plugin registers the REST routes these cards read. The standalone
	// Stats plugin prints an empty `jetpack_version` when Jetpack is not active;
	// stats-admin releases older than that key ship only with the Jetpack plugin.
	if ( optionalConfig( 'jetpack_version' ) === '' ) {
		return null;
	}

	// SiteProtection runs the module queries, so it mounts only once both gates pass.
	return <SiteProtection siteId={ siteId } adminBaseUrl={ adminBaseUrl } />;
}
