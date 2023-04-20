import { ShortenedNumber } from '@automattic/components';
import { protect, akismet } from '@automattic/components/src/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import wpcom from 'calypso/lib/wp';
import useModuleDataQuery from '../hooks/use-module-data-query';
import useMyJetpackProductsQuery from '../hooks/use-my-jetpack-products-query';

import './modules.scss';

function isProductActive( products, productSlug ) {
	return products && products[ productSlug ]?.is_plugin_active;
}

function ModuleCard( { icon, title, value, activateProduct, className = null, info = null } ) {
	return (
		<div className={ classNames( 'stats-widget-module stats-widget-card', className ) }>
			<div className="stats-widget-module__icon">{ icon }</div>
			<div className="stats-widget-module__title">{ title }</div>
			{ isFinite( value ) && (
				<div className="stats-widget-module__value">
					<ShortenedNumber value={ value } />
				</div>
			) }
			{ ! isFinite( value ) && (
				<div className="stats-widget-module__info">
					{ value === 'not_active' && <button onClick={ activateProduct }>Activate</button> }
					{ /* Module `protect` is always installed. So it wouldn't go to the branch below. */ }
					{ value === 'not_installed' && info && <a href={ info.link }>{ info.text }</a> }
					{ /** TODO: deal with `invalid_key`, probably just use an `else` */ }
				</div>
			) }
		</div>
	);
}

export default function Modules() {
	const translate = useTranslate();

	const { data: akismetData } = useModuleDataQuery( 'akismet' );
	const { data: protectData } = useModuleDataQuery( 'protect' );
	const { data: jetpackProducts } = useMyJetpackProductsQuery();

	const activateProduct = ( productSlug ) => () => {
		return wpcom.req
			.post( {
				apiNamespace: 'my-jetpack/v1',
				path: `/site/products/${ productSlug }`,
			} )
			.then( () => {
				if ( jetpackProducts && jetpackProducts[ productSlug ]?.post_activation_url ) {
					window.location.href = jetpackProducts[ productSlug ]?.post_activation_url;
					return;
				}
				window.location.reload();
			} );
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
			.then( () => window.location.reload() );
	};

	return (
		<div className="stats-widget-modules">
			<ModuleCard
				icon={ protect }
				title={ translate( 'Total blocked login attempts' ) }
				value={ protectData }
				active={ isProductActive( jetpackProducts, 'protect' ) }
				activateProduct={ activateModule( 'protect' ) }
			/>
			<ModuleCard
				icon={ akismet }
				title={ translate( 'Total blocked spam comments' ) }
				value={ akismetData }
				active={ isProductActive( jetpackProducts, 'anti-spam' ) }
				activateProduct={ activateProduct( 'anti-spam' ) }
				info={ {
					link: 'https://akismet.com/?utm_source=jetpack&utm_medium=link&utm_campaign=Jetpack%20Dashboard%20Widget%20Footer%20Link',
					text: translate( 'Anti-spam can help to keep your blog safe from spam!' ),
				} }
			/>
		</div>
	);
}
