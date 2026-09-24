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

interface ProtectModuleProps {
	siteId: number;
}

interface ModulesProps extends ProtectModuleProps {
	adminBaseUrl: null | string;
}

interface AkismetModuleProps extends ProtectModuleProps {
	manageUrl: string;
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

const AkismetModule: FunctionComponent< AkismetModuleProps > = ( { siteId, manageUrl } ) => {
	const translate = useTranslate();

	const {
		data: akismetData,
		isLoading: isAkismetLoading,
		refetch: refetchAkismetData,
		isError: isAkismetError,
		error: akismetError,
	} = useModuleDataQuery( 'akismet' );

	// The function installs Akismet plugin if not exists.
	const activateProduct = ( productSlug: string ) => () => {
		return wpcom.req
			.post( {
				apiNamespace: 'my-jetpack/v1',
				path: `/site/products/${ productSlug }`,
			} )
			.then( refetchAkismetData );
	};

	return (
		<ModuleCard
			title={ translate( 'Blocked spam comments' ) }
			value={ akismetData as number }
			describe={ ( count ) =>
				translate( '%(count)s blocked spam comment', '%(count)s blocked spam comments', {
					count: akismetData as number,
					args: { count },
				} ) as string
			}
			isError={ isAkismetError }
			error={ akismetError instanceof Error ? akismetError.message : '' }
			isLoading={ isAkismetLoading }
			canManageModule={ canCurrentUser( siteId, 'manage_options' ) }
			activateProduct={ activateProduct( 'anti-spam' ) }
			manageUrl={ manageUrl }
		/>
	);
};

const ProtectModule: FunctionComponent< ProtectModuleProps > = ( { siteId } ) => {
	const translate = useTranslate();

	const {
		data: protectData,
		isLoading: isProtectLoading,
		refetch: refetchProtectData,
		isError: isProtectError,
		error: protectError,
	} = useModuleDataQuery( 'protect' );

	const activateModule = ( module: string ) => () => {
		return wpcom.req
			.post( { path: '/settings', apiNamespace: 'jetpack/v4' }, { [ module ]: true } )
			.then( refetchProtectData );
	};

	return (
		<ModuleCard
			title={ translate( 'Blocked login attempts' ) }
			value={ protectData as number }
			describe={ ( count ) =>
				translate( '%(count)s blocked login attempt', '%(count)s blocked login attempts', {
					count: protectData as number,
					args: { count },
				} ) as string
			}
			isError={ isProtectError }
			error={ protectError instanceof Error ? protectError.message : '' }
			isLoading={ isProtectLoading }
			canManageModule={ canCurrentUser( siteId, 'manage_options' ) }
			activateProduct={ activateModule( 'protect' ) }
		/>
	);
};

const SiteProtection: FunctionComponent< ModulesProps > = ( { siteId, adminBaseUrl } ) => {
	const translate = useTranslate();
	const canManageModules = canCurrentUser( siteId, 'manage_options' );

	// Both cards query through these keys too, so this reads their cached state rather
	// than fetching again.
	const { isError: isProtectError } = useModuleDataQuery( 'protect' );
	const { isError: isAkismetError } = useModuleDataQuery( 'akismet' );

	// A card hides itself when its figure failed and the viewer cannot act on it; with
	// both hidden the section would be an empty card.
	const hasProtect = ! isProtectError || canManageModules;
	const hasAkismet = ! isAkismetError || canManageModules;
	if ( ! hasProtect && ! hasAkismet ) {
		return null;
	}

	// Doubles as the Akismet key configuration page, which is where its spam figures live.
	// WordPress registers it with the plugin, so it exists only while Akismet reports a
	// figure; the card offers its own link for the key that needs fixing.
	const akismetUrl = adminBaseUrl + 'admin.php?page=akismet-key-config';

	return (
		<WidgetSection
			title={ translate( 'All-time site protection' ) }
			icon={ shield }
			className="stats-widget-modules"
		>
			<div className="stats-widget-metrics">
				<ProtectModule siteId={ siteId } />
				<AkismetModule
					siteId={ siteId }
					// The URL is used to redirect the user to the Akismet Key configuration page.
					manageUrl={ akismetUrl }
				/>
			</div>
			{ ! isAkismetError && (
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

	// The cards' queries all run inside this component, so a site that fails either gate
	// never asks for routes it does not serve.
	return <SiteProtection siteId={ siteId } adminBaseUrl={ adminBaseUrl } />;
}
