import { Button } from '@wordpress/components';
import { shield } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState, FunctionComponent } from 'react';
import wpcom from 'calypso/lib/wp';
import useModuleDataQuery from '../hooks/use-module-data-query';
import hasSiteProtection from '../lib/has-site-protection';
import canCurrentUser from '../lib/selectors/can-current-user';
import MetricValue from './metric-value';
import { recordWidgetEventThenFollow } from './record-widget-event';
import WidgetSection from './widget-section';
import './modules.scss';

// Routes whose failure message is a sentence meant for the viewer. Others, such as
// `some_updated` from `/settings`, prefix the module slug and HTML-escape the text.
const USER_FACING_ERROR_CODES = new Set( [ 'rest_forbidden', 'not_allowed' ] );

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
	/**
	 * Whether the route behind the Install and Activate buttons asks for more than
	 * `canManageModule` covers.
	 */
	canActivate?: boolean;
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
	canActivate = true,
	isLoading,
	isError,
	className = null,
} ) => {
	const translate = useTranslate();
	const [ disabled, setDisabled ] = useState( false );
	const [ failure, setFailure ] = useState< string | null >( null );
	const onActivateProduct = () => {
		setDisabled( true );
		setFailure( null );
		activateProduct().catch( ( activationError: { code?: string; message?: string } ) => {
			setDisabled( false );
			setFailure(
				( USER_FACING_ERROR_CODES.has( activationError?.code ?? '' ) && activationError.message ) ||
					( translate( 'Something went wrong. Please try again.' ) as string )
			);
		} );
	};

	const needsActivation = error === 'not_active' || error === 'not_installed';
	const canAct = canManageModule && ( ! needsActivation || canActivate );

	// Nothing worth showing: the figure is unknown and the viewer cannot act on it, so a
	// zero would read as a real count.
	if ( isError && ! canAct ) {
		return null;
	}

	return (
		<div
			className={ clsx( 'stats-widget-module', 'stats-widget-metric', className ) }
			aria-label={ title }
		>
			<div className="stats-widget-metric__title">{ title }</div>
			{ ( isLoading || ! isError ) && (
				<MetricValue
					value={ Number.isFinite( value ) ? value : 0 }
					describe={ describe }
					isLoading={ isLoading }
				/>
			) }
			{ ! isLoading && (
				<>
					{ isError && canAct && (
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
							{ failure && (
								<p className="stats-widget-module__error" role="alert">
									{ failure }
								</p>
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
	// My Jetpack installs and activates the Akismet plugin, so its route asks for
	// `activate_plugins`, which a site administrator on a multisite network lacks unless the
	// network grants it. Protect is a Jetpack module, and `/settings` needs only `manage_options`.
	const canActivatePlugins = canCurrentUser( siteId, 'activate_plugins' );
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

	// Either route installs Akismet first when it is missing. The widget is served from the CDN
	// to every Jetpack version, and before 14.3 My Jetpack has only the per-product route
	// `site/products/{slug}`; it is tried first because it also matches `/site/products/activate`
	// and answers 400 there, while current Jetpack has no route at `/site/products/anti-spam`.
	// Drop the per-product call once Jetpack 14.3 is the minimum.
	const activateAkismet = () =>
		wpcom.req
			.post( { apiNamespace: 'my-jetpack/v1', path: '/site/products/anti-spam' } )
			.catch( ( error: { code?: string } ) => {
				if ( error?.code !== 'rest_no_route' ) {
					throw error;
				}
				return wpcom.req.post(
					{ apiNamespace: 'my-jetpack/v1', path: '/site/products/activate' },
					{ products: [ 'anti-spam' ] }
				);
			} )
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
			{ /* The placeholders are decorative, so this is the one word a screen reader gets
			     while the counts load. */ }
			{ ( protect.isPending || akismet.isPending ) && (
				<span className="screen-reader-text">{ translate( 'Loading…' ) }</span>
			) }
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
					canActivate={ canActivatePlugins }
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
	// SiteProtection runs the module queries, so it mounts only once the gate passes.
	if ( ! hasSiteProtection() ) {
		return null;
	}

	return <SiteProtection siteId={ siteId } adminBaseUrl={ adminBaseUrl } />;
}
