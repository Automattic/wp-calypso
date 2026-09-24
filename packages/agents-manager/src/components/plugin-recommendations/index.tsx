import { useQuery } from '@tanstack/react-query';
import { Button, Spinner } from '@wordpress/components';
import { __, getLocaleData } from '@wordpress/i18n';
import { normalizeRecommendations } from '../../abilities/render-plugin-recommendations';
import { useAgentsManagerContext } from '../../contexts';
import { fetchRecommendation } from './catalog';
import type { PluginRecommendation } from '../../abilities/render-plugin-recommendations';

function Recommendation( { pick }: { pick: PluginRecommendation } ) {
	const { site } = useAgentsManagerContext();
	const { slug, source } = pick;
	const localeData = getLocaleData()?.[ '' ];
	const locale =
		! Array.isArray( localeData ) && typeof localeData?.lang === 'string' ? localeData.lang : 'en';
	const { data, isPending, isError, refetch } = useQuery( {
		queryKey: [ 'am-plugin-recommendation', slug, source, locale ],
		queryFn: () => fetchRecommendation( { slug, source }, locale ),
	} );
	const sitePath = site?.ID ? `/${ site.ID }` : '';
	return (
		<li>
			<strong>{ data?.name ?? pick.slug }</strong>
			<p>{ pick.why }</p>
			{ isPending && <Spinner /> }
			{ isError && (
				<Button variant="link" onClick={ () => refetch() }>
					{ __( 'Retry loading plugin', __i18n_text_domain__ ) }
				</Button>
			) }
			{ ! isPending && ! isError && ! data && (
				<p>{ __( 'This plugin is no longer available.', __i18n_text_domain__ ) }</p>
			) }
			{ data && (
				<Button
					variant="link"
					href={ `https://wordpress.com/plugins/${ encodeURIComponent( pick.slug ) }${ sitePath }` }
				>
					{ __( 'View plugin', __i18n_text_domain__ ) }
				</Button>
			) }
		</li>
	);
}

export default function PluginRecommendations( { picks }: { picks?: unknown } ) {
	return (
		<ol>
			{ normalizeRecommendations( picks ).map( ( pick ) => (
				<Recommendation key={ pick.slug } pick={ pick } />
			) ) }
		</ol>
	);
}
