import { Gridicon } from '@automattic/components';
import { useSibylQuery, SiteDetails } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useDebounce } from 'use-debounce';

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

	if ( ! sibylArticles?.length ) {
		return null;
	}

	return (
		<>
			<h3 className="help-center-sibyl-articles__title">
				{ __( 'Do you want the answer to any of these questions?', __i18n_text_domain__ ) }
			</h3>
			<ul className="help-center-sibyl-articles__list">
				{ sibylArticles.map( ( article ) => (
					<li>
						<a href={ article.link } target="_blank" rel="noreferrer noopener">
							<Gridicon icon="book"></Gridicon>
							{ article.title }
						</a>
					</li>
				) ) }
			</ul>
		</>
	);
}
