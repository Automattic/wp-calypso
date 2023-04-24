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
	info = null,
} ) {
	const translate = useTranslate();
	const [ disabled, setDisabled ] = useState( false );
	return (
		<div className={ classNames( 'stats-widget-module stats-widget-card', className ) }>
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
									disabled={ disabled }
									onClick={ () => {
										setDisabled( true );
										activateProduct().catch( () => setDisabled( false ) );
									} }
								>
									Activate
								</button>
							) }
							{ /* TODO: add button to install plugins. */ }
							{ error !== 'not_active' && info && (
								<a href={ info.link } target="__blank">
									{ info.text }
								</a>
							) }
							{ error !== 'not_active' && ! info && <p>{ translate( 'An error occurred.' ) }</p> }
						</div>
					) }
				</>
			) }
		</div>
	);
}

function AkismetModule( { siteId } ) {
	const translate = useTranslate();

	const {
		data: akismetData,
		isLoading: isAkismetLoading,
		refetch: refetchAkismetData,
		isError: isAkismetError,
		error: akismetError,
	} = useModuleDataQuery( 'akismet' );

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
			activateProduct={
				canCurrentUser( siteId, 'manage_options' ) && activateProduct( 'anti-spam' )
			}
			info={ {
				link: 'https://akismet.com/?utm_source=jetpack&utm_medium=link&utm_campaign=Jetpack%20Dashboard%20Widget%20Footer%20Link',
				text: translate( 'Anti-spam can help to keep your blog safe from spam!' ),
			} }
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
			activateProduct={ canCurrentUser( siteId, 'manage_options' ) && activateModule( 'protect' ) }
		/>
	);
}

export default function Modules( { siteId } ) {
	return (
		<div className="stats-widget-modules">
			<ProtectModule siteId={ siteId } />
			<AkismetModule siteId={ siteId } />
		</div>
	);
}
