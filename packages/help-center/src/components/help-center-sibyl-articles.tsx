import { useSibylQuery, SiteDetails, useSiteIntent } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Icon, page } from '@wordpress/icons';
import { useDebounce } from 'use-debounce';
import { getContextResults } from '../contextual-help/contextual-help';

export const SITE_STORE = 'automattic/site' as const;

type Props = {
	message: string | undefined;
	supportSite: SiteDetails | undefined;
};

export function SibylArticles( { message, supportSite }: Props ) {
	const isAtomic = Boolean(
		useSelect( ( select ) => supportSite && select( SITE_STORE ).isSiteAtomic( supportSite?.ID ) )
	);
	const isJetpack = Boolean(
		useSelect( ( select ) => select( SITE_STORE ).isJetpackSite( supportSite?.ID ) )
	);

	const [ debouncedMessage ] = useDebounce( message || '', 500 );

	const { data: sibylArticles } = useSibylQuery( debouncedMessage, isJetpack, isAtomic );

	const { data: intent } = useSiteIntent( supportSite?.ID );

	const articles = sibylArticles?.length
		? sibylArticles
		: getContextResults( 'gutenberg-editor', intent?.site_intent ?? '' );

	return (
		<div className="help-center-sibyl-articles__container">
			<h3 id="help-center--contextual_help" className="help-center-sibyl-articles__title">
				{ __( 'Recommended resources', __i18n_text_domain__ ) }
			</h3>
			<ul
				className="help-center-sibyl-articles__list"
				aria-labelledby="help-center--contextual_help"
			>
				{ articles.map( ( article ) => (
					<li>
						<a href={ article.link } target="_blank" rel="noreferrer noopener">
							<Icon icon={ page } />
							{ article.title }
						</a>
					</li>
				) ) }
			</ul>
		</div>
	);
}
