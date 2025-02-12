import { Button } from '@automattic/components';
import { protect, akismet } from '@automattic/components/src/icons';
import clsx from 'clsx';
import { useTranslate, numberFormat } from 'i18n-calypso';
import { useState, FunctionComponent } from 'react';
import wpcom from 'calypso/lib/wp';
import useModuleDataQuery from '../hooks/use-module-data-query';
import canCurrentUser from '../lib/selectors/can-current-user';

import './modules.scss';

interface ModuleCardProps {
	icon: JSX.Element;
	title: string;
	value: number;
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
	icon,
	title,
	value,
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
	return (
		<div
			className={ clsx( 'stats-widget-module stats-widget-card', className ) }
			aria-label={ title }
		>
			<div className="stats-widget-module__icon">{ icon }</div>
			<div className="stats-widget-module__title">{ title }</div>
			{ isLoading && <div className="stats-widget-module__value">-</div> }
			{ ! isLoading && (
				<>
					{ ( ! isError || ! canManageModule ) && (
						<div className="stats-widget-module__value">
							<span>
								{ numberFormat( value, {
									numberFormatOptions: {
										notation: 'compact',
										maximumFractionDigits: 1,
									},
								} ) }
							</span>
						</div>
					) }
					{ isError && canManageModule && (
						<div className="stats-widget-module__info">
							{ error === 'not_active' && (
								<Button
									primary
									className="jetpack-emerald-button"
									busy={ disabled }
									onClick={ onActivateProduct }
								>
									{ translate( 'Activate' ) }
								</Button>
							) }
							{ error === 'not_installed' && (
								<Button
									transparent
									className="jetpack-emerald-button"
									busy={ disabled }
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
			icon={ akismet }
			title={ translate( 'Blocked spam comments' ) }
			value={ akismetData as number }
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
			title={ translate( 'Blocked login attempts' ) }
			value={ protectData as number }
			isError={ isProtectError }
			error={ protectError instanceof Error ? protectError.message : '' }
			isLoading={ isProtectLoading }
			canManageModule={ canCurrentUser( siteId, 'manage_options' ) }
			activateProduct={ activateModule( 'protect' ) }
		/>
	);
};

export default function Modules( { siteId, adminBaseUrl }: ModulesProps ) {
	return (
		<div className="stats-widget-modules">
			<ProtectModule siteId={ siteId } />
			<AkismetModule
				siteId={ siteId }
				// The URL is used to redirect the user to the Akismet Key configuration page.
				manageUrl={ adminBaseUrl + 'admin.php?page=akismet-key-config' }
			/>
		</div>
	);
}
