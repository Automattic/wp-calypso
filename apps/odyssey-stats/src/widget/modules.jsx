import { ShortenedNumber } from '@automattic/components';
import { protect, akismet } from '@automattic/components/src/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import wpcom from 'calypso/lib/wp';
import useModuleDataQuery from '../hooks/use-module-data-query';
import config from '../lib/config-api';

import './modules.scss';

const canCurrentUser = ( siteId, capability ) =>
	!! config( 'intial_state' )?.currentUser?.capabilities?.[ siteId ]?.[ capability ];

function ModuleCard( {
	icon,
	title,
	value,
	activateProduct,
	active,
	className = null,
	info = null,
} ) {
	const translate = useTranslate();
	const [ disabled, setDisabled ] = useState( false );
	return (
		<div className={ classNames( 'stats-widget-module stats-widget-card', className ) }>
			<div className="stats-widget-module__icon">{ icon }</div>
			<div className="stats-widget-module__title">{ title }</div>
			{ ( active || ! activateProduct ) && (
				<div className="stats-widget-module__value">
					<ShortenedNumber value={ value } />
				</div>
			) }
			{ ! active && activateProduct && (
				<div className="stats-widget-module__info">
					{ value === 'not_active' && (
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
					{ value !== 'not_active' && info && (
						<a href={ info.link } target="__blank">
							{ info.text }
						</a>
					) }
					{ value !== 'not_active' && ! info && <p>{ translate( 'An error occurred.' ) }</p> }
				</div>
			) }
		</div>
	);
}

export default function Modules( { siteId } ) {
	const translate = useTranslate();

	const { data: akismetData, refetch: refetchAkismetData } = useModuleDataQuery( 'akismet' );
	const {
		data: protectData,
		isError: isProtectError,
		refetch: refetchProtectData,
	} = useModuleDataQuery( 'protect' );

	const activateProduct = ( productSlug ) => () => {
		return wpcom.req
			.post( {
				apiNamespace: 'my-jetpack/v1',
				path: `/site/products/${ productSlug }`,
			} )
			.then( refetchAkismetData );
	};

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
		<div className="stats-widget-modules">
			<ModuleCard
				icon={ protect }
				title={ translate( 'Total blocked login attempts' ) }
				// API return 404 error when module is not enabled.
				value={ ! isProtectError ? protectData : 'not_active' }
				// Hide buttons etc for non-admins.
				active={ ! canCurrentUser( siteId, 'manage_options' ) || ! isProtectError }
				activateProduct={
					canCurrentUser( siteId, 'manage_options' ) && activateModule( 'protect' )
				}
			/>
			<ModuleCard
				icon={ akismet }
				title={ translate( 'Total blocked spam comments' ) }
				value={ akismetData }
				// Hide buttons etc for non-admins.
				active={ ! canCurrentUser( siteId, 'manage_options' ) || isFinite( akismetData ) }
				activateProduct={
					canCurrentUser( siteId, 'manage_options' ) && activateProduct( 'anti-spam' )
				}
				info={ {
					link: 'https://akismet.com/?utm_source=jetpack&utm_medium=link&utm_campaign=Jetpack%20Dashboard%20Widget%20Footer%20Link',
					text: translate( 'Anti-spam can help to keep your blog safe from spam!' ),
				} }
			/>
		</div>
	);
}
