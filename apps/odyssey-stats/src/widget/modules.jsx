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

function ModuleCard( { icon, title, value, activateProduct, className = null, active = true } ) {
	return (
		<div className={ classNames( 'stats-widget-module stats-widget-card', className ) }>
			<div className="stats-widget-module__icon">{ icon }</div>
			<div className="stats-widget-module__title">{ title }</div>
			<div className="stats-widget-module__value">
				{ active && <ShortenedNumber value={ value } /> }
				{ ! active && <button onClick={ activateProduct }>Activate</button> }
			</div>
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

	return (
		<div className="stats-widget-modules">
			<ModuleCard
				icon={ protect }
				title={ translate( 'Total blocked login attempts' ) }
				value={ protectData }
				active={ isProductActive( jetpackProducts, 'protect' ) }
				activateProduct={ activateProduct( 'protect' ) }
			/>
			<ModuleCard
				icon={ akismet }
				title={ translate( 'Total blocked spam comments' ) }
				value={ akismetData }
				active={ isProductActive( jetpackProducts, 'anti-spam' ) }
				activateProduct={ activateProduct( 'anti-spam' ) }
			/>
		</div>
	);
}
