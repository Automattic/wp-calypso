/* eslint-disable no-restricted-imports */
/* eslint-disable wpcalypso/jsx-classname-namespace */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	useSibylQuery,
	SiteDetails,
	useSiteIntent,
	getContextResults,
} from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { useSelect } from '@wordpress/data';
import { Icon, page } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link, LinkProps } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { getSectionName } from 'calypso/state/ui/selectors';
import { Article } from '../types';

export const SITE_STORE = 'automattic/site' as const;

type Props = {
	title?: string;
	message?: string;
	supportSite?: SiteDetails;
};

function recordSibylArticleClick(
	article: ReturnType< typeof getContextResults >[ number ] | Article
) {
	return () =>
		recordTracksEvent( 'calypso_helpcenter_page_open_sibyl_article', {
			location: 'help-center',
			article_link: article.link,
			article_title: article.title,
		} );
}
const ConfigurableLink: React.FC<
	{
		article: ReturnType< typeof getContextResults >[ number ] | Article;
		external: boolean;
		fullUrl: string;
	} & LinkProps
> = ( { article, external, fullUrl, ...props } ) => {
	if ( external ) {
		return <a href={ fullUrl } target="_blank" rel="noreferrer noopener" { ...props } />;
	}
	return <Link onClick={ recordSibylArticleClick( article ) } { ...props } />;
};

function getPostUrl( article: Article, query: string ) {
	// if it's a wpcom support article, it has an ID
	if ( article.post_id ) {
		const params = new URLSearchParams( {
			postId: article.post_id,
			query,
			link: article.link ?? '',
			title: article.title,
		} );

		if ( article.blog_id ) {
			params.set( 'blogId', article.blog_id );
		}

		const search = params.toString();

		return {
			pathname: '/post',
			search,
		};
	}
	return article.link;
}

export function SibylArticles( { message = '', supportSite, title }: Props ) {
	const { __ } = useI18n();
	const locale = useLocale();

	const isAtomic = Boolean(
		useSelect( ( select ) => supportSite && select( SITE_STORE ).isSiteAtomic( supportSite?.ID ) )
	);
	const isJetpack = Boolean(
		useSelect( ( select ) => select( SITE_STORE ).isJetpackSite( supportSite?.ID ) )
	);

	const [ debouncedMessage ] = useDebounce( message || '', 500 );

	const { data: sibylArticles } = useSibylQuery( debouncedMessage, isJetpack, isAtomic );

	const { data: intent } = useSiteIntent( supportSite?.ID );

	const sectionName = useSelector( getSectionName );
	const articles = useMemo( () => {
		return sibylArticles?.length
			? sibylArticles
			: getContextResults( sectionName, intent?.site_intent ?? '' );
	}, [ sibylArticles, sectionName, intent?.site_intent ] );

	return (
		<div className="help-center-sibyl-articles__container">
			<h3 id="help-center--contextual_help" className="help-center__section-title">
				{ title || __( 'Recommended resources', __i18n_text_domain__ ) }
			</h3>
			<ul
				className="help-center-sibyl-articles__list"
				aria-labelledby="help-center--contextual_help"
			>
				{ articles.map( ( article, index ) => {
					if ( 'type' in article && [ 'video', 'tour' ].includes( article.type ) ) {
						return;
					}
					return (
						<li key={ article.link + index }>
							<ConfigurableLink
								to={ getPostUrl( article as Article, message ) }
								external={ 'en' !== locale }
								fullUrl={ article.link }
								article={ article }
							>
								<Icon icon={ page } />
								{ article.title }
							</ConfigurableLink>
						</li>
					);
				} ) }
			</ul>
		</div>
	);
}
