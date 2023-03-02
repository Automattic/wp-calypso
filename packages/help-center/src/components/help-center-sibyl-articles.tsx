/* eslint-disable no-restricted-imports */
/* eslint-disable wpcalypso/jsx-classname-namespace */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	useSibylQuery,
	SiteDetails,
	useSiteIntent,
	getContextResults,
	RESULT_TOUR,
	RESULT_VIDEO,
	HelpCenterSite,
} from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { external, Icon, page } from '@wordpress/icons';
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
	supportSite?: SiteDetails | HelpCenterSite;
	articleCanNavigateBack?: boolean;
};

function recordSibylArticleClick(
	article: ReturnType< typeof getContextResults >[ number ] | Article
) {
	return () =>
		recordTracksEvent( 'calypso_helpcenter_page_open_sibyl_article', {
			force_site_id: true,
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

function getPostUrl( article: Article, query: string, articleCanNavigateBack: boolean ) {
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

		if ( articleCanNavigateBack ) {
			params.set( 'canNavigateBack', String( articleCanNavigateBack ) );
		}

		const search = params.toString();

		return {
			pathname: '/post',
			search,
		};
	}
}

const getFilteredContextResults = ( sectionName: string, siteIntent: string ) => {
	return getContextResults( sectionName, siteIntent ).filter( ( article ) => {
		const type = ( 'type' in article && article.type ) || '';
		return ! [ RESULT_VIDEO, RESULT_TOUR ].includes( type );
	} );
};

export function SibylArticles( {
	message = '',
	supportSite,
	title,
	articleCanNavigateBack = false,
}: Props ) {
	const { __ } = useI18n();
	const locale = useLocale();

	const isAtomic = Boolean( supportSite?.is_wpcom_atomic );
	const isJetpack = Boolean( supportSite?.jetpack );

	const [ debouncedMessage ] = useDebounce( message || '', 500 );

	const { data: sibylArticles } = useSibylQuery( debouncedMessage, isJetpack, isAtomic );
	const { data: intent } = useSiteIntent( supportSite?.ID );

	const sectionName = useSelector( getSectionName );
	const articles = useMemo( () => {
		if ( sibylArticles?.length ) {
			recordTracksEvent( 'calypso_helpcenter_sibyl_display_results', {
				location: 'help-center',
				resultsCount: sibylArticles.length,
			} );
		}

		return (
			sibylArticles?.length
				? sibylArticles
				: getFilteredContextResults( sectionName, intent?.site_intent ?? '' )
		 ).map( ( article ) => {
			const hasPostId = 'post_id' in article && article.post_id;
			return {
				...article,
				url: hasPostId
					? getPostUrl( article as Article, message, articleCanNavigateBack )
					: article.link,
				is_external: 'en' !== locale || ! hasPostId,
			};
		} );
	}, [ sibylArticles, sectionName, intent?.site_intent, locale, message, articleCanNavigateBack ] );

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
					return (
						<li key={ article.link + index }>
							<ConfigurableLink
								to={ article.url }
								external={ article.is_external }
								fullUrl={ article.link }
								article={ article }
							>
								<Icon icon={ page } />
								<span>{ article.title }</span>
								{ ( article as Article ).is_external && <Icon icon={ external } size={ 20 } /> }
							</ConfigurableLink>
						</li>
					);
				} ) }
			</ul>
		</div>
	);
}
