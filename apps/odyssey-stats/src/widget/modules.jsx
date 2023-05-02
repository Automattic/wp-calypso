import { ShortenedNumber } from '@automattic/components';
import { protect, akismet } from '@automattic/components/src/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import wpcom from 'calypso/lib/wp';
import useModuleDataQuery from '../hooks/use-module-data-query';
import canCurrentUser from '../lib/can-current-user';

import './modules.scss';

function ModuleCard( {
	icon,
	title,
	value,
	error,
	activateProduct,
	isLoading = true,
	isError = false,
	canManageModule = false,
	className = null,
	manageUrl = null,
} ) {
	const translate = useTranslate();
	const [ disabled, setDisabled ] = useState( false );
	const onActivateProduct = () => {
		setDisabled( true );
		activateProduct().catch( () => setDisabled( false ) );
	};
	return (
		<div
			className={ classNames( 'stats-widget-module stats-widget-card', className ) }
			aria-label={ title }
		>
			<div className="stats-widget-module__icon">{ icon }</div>
			<div className="stats-widget-module__title">{ title }</div>
			{ isLoading && <div className="stats-widget-module__value">-</div> }
			{ ! isLoading && (
				<>
					{ ( ! isError || ! canManageModule ) && (
						<div className="stats-widget-module__value">
							<ShortenedNumber value={ value } />
						</div>
					) }
					{ isError && canManageModule && (
						<div className="stats-widget-module__info">
							{ error === 'not_active' && (
								<button
									className="jetpack-emerald-button"
									disabled={ disabled }
									onClick={ onActivateProduct }
								>
									Activate
								</button>
							) }
							{ error === 'not_installed' && (
								<button
									className="jetpack-emerald-button is-secondary-jetpack-emerald"
									disabled={ disabled }
									onClick={ onActivateProduct }
								>
									Install
								</button>
							) }
							{ error === 'invalid_key' && (
								<a href={ manageUrl } target="_self">
									Manage Akismet Key
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
}

function AkismetModule( { siteId, manageUrl } ) {
	const translate = useTranslate();

	const {
		data: akismetData,
		isLoading: isAkismetLoading,
		refetch: refetchAkismetData,
		isError: isAkismetError,
		error: akismetError,
	} = useModuleDataQuery( 'akismet' );

	// The function installs Akismet plugin if not exists.
	const activateProduct = ( productSlug ) => () => {
		return wpcom.req
			.post( {
				apiNamespace: 'my-jetpack/v1',
				path: `/site/products/${ productSlug }`,
			} )
			.then( refetchAkismetData );
	};

	return (
		<ModuleCard
			icon={ akismet }
			title={ translate( 'Total blocked spam comments' ) }
			value={ akismetData }
			isError={ isAkismetError }
			error={ akismetError?.message }
			isLoading={ isAkismetLoading }
			canManageModule={ canCurrentUser( siteId, 'manage_options' ) }
			activateProduct={ activateProduct( 'anti-spam' ) }
			manageUrl={ manageUrl }
		/>
	);
}

function ProtectModule( { siteId } ) {
	const translate = useTranslate();

	const {
		data: protectData,
		isLoading: isProtectLoading,
		refetch: refetchProtectData,
		isError: isProtectError,
		error: protectError,
	} = useModuleDataQuery( 'protect' );

	const activateModule = ( module ) => () => {
		return wpcom.req
			.post(
				{
					apiNamespace: 'jetpack/v4',
					path: `/settings`,
				},
				{
					[ module ]: true,
				}
			)
			.then( refetchProtectData );
	};

	return (
		<ModuleCard
			icon={ protect }
			title={ translate( 'Total blocked login attempts' ) }
			value={ protectData }
			isError={ isProtectError }
			error={ protectError?.message }
			isLoading={ isProtectLoading }
			canManageModule={ canCurrentUser( siteId, 'manage_options' ) }
			activateProduct={ activateModule( 'protect' ) }
		/>
	);
}

export default function Modules( { siteId, odysseyStatsBaseUrl } ) {
	return (
		<div className="stats-widget-modules">
			<ProtectModule siteId={ siteId } />
			<AkismetModule
				siteId={ siteId }
				// The URL is used to redirect the user to the Akismet Key configuration page.
				manageUrl={
					odysseyStatsBaseUrl &&
					odysseyStatsBaseUrl.replaceAll( /page=stats/g, 'page=akismet-key-config' )
				}
			/>
		</div>
	);
}
