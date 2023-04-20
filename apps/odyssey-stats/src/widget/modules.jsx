import { ShortenedNumber } from '@automattic/components';
import { protect, akismet } from '@automattic/components/src/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import useModuleDataQuery from '../hooks/use-module-data-query';
import useMyJetpackProductsQuery from '../hooks/use-my-jetpack-products-query';

import './modules.scss';

function isProductActive( products, productSlug ) {
	return products && products[ productSlug ]?.is_plugin_active;
}

function ModuleCard( { icon, title, value, className = null, active = true } ) {
	return (
		<div className={ classNames( 'stats-widget-module stats-widget-card', className ) }>
			<div className="stats-widget-module__icon">{ icon }</div>
			<div className="stats-widget-module__title">{ title }</div>
			<div className="stats-widget-module__value">
				{ active && <ShortenedNumber value={ value } /> }
				{ ! active && <button>Activate</button> }
			</div>
		</div>
	);
}

export default function Modules() {
	const translate = useTranslate();

	const { data: akismetData, isFetching: isFetchingAkismet } = useModuleDataQuery( 'akismet' );
	const { data: protectData, isFetching: isFetchingProtect } = useModuleDataQuery( 'protect' );
	const { data: jetpackProducts, isFetching: isFetchingJetpackProducts } =
		useMyJetpackProductsQuery();

	return (
		<div className="stats-widget-modules">
			<ModuleCard
				icon={ protect }
				title={ translate( 'Total blocked login attempts' ) }
				value={ protectData }
				isLoading={ isFetchingProtect || isFetchingJetpackProducts }
				active={ isProductActive( jetpackProducts, 'protect' ) }
			/>
			<ModuleCard
				icon={ akismet }
				title={ translate( 'Total blocked spam comments' ) }
				value={ akismetData }
				isLoading={ isFetchingAkismet || isFetchingJetpackProducts }
				active={ isProductActive( jetpackProducts, 'anti-spam' ) }
			/>
		</div>
	);
}
