import { Fragment, type MouseEvent, type ReactNode } from 'react';
import isA8CForAgencies from '../../../lib/a8c-for-agencies/is-a8c-for-agencies';
import isJetpackCloud from '../../../lib/jetpack/is-jetpack-cloud';
import type { ActivityBlockContent, ActivityBlockNode } from './formatted-block-parser';

export interface ActivityBlockMeta {
	activity?: string;
	intent?: string;
	section?: string;
	published?: number | string;
}

type BlockClickHandler = ( event: MouseEvent< HTMLAnchorElement > ) => void;

type BlockRenderer = ( args: {
	content: ActivityBlockNode;
	children: ReactNode[];
	onClick: BlockClickHandler | null;
	meta: ActivityBlockMeta;
} ) => ReactNode;

interface FormattedBlockProps {
	content: ActivityBlockContent;
	onClick: BlockClickHandler | null;
	meta: ActivityBlockMeta;
}

const Strong = ( { children }: { children: ReactNode } ) => <strong>{ children }</strong>;

const Emphasis = ( { children }: { children: ReactNode } ) => <em>{ children }</em>;

const Preformatted = ( { children }: { children: ReactNode } ) => <pre>{ children }</pre>;

const isWordPressDotComUrl = ( url?: string | null ) =>
	!! url && url.startsWith( 'https://wordpress.com' );

const relativizeWordPressUrl = ( url: string ) => url.replace( /^https:\/\/wordpress\.com/, '' );

const Link: BlockRenderer = ( { content, children, onClick, meta } ) => {
	const {
		url: originalUrl,
		activity,
		section,
		intent,
	} = content as ActivityBlockNode & {
		url?: string;
		activity?: string;
		section?: string;
		intent?: string;
	};

	if ( ! originalUrl ) {
		return <Fragment>{ children }</Fragment>;
	}

	if ( isWordPressDotComUrl( originalUrl ) ) {
		if ( isJetpackCloud() || isA8CForAgencies() ) {
			return <Fragment>{ children }</Fragment>;
		}

		return (
			<a
				href={ relativizeWordPressUrl( originalUrl ) }
				onClick={ onClick ?? undefined }
				data-activity={ activity ?? meta.activity }
				data-section={ section ?? meta.section }
				data-intent={ intent ?? meta.intent }
			>
				{ children }
			</a>
		);
	}

	return (
		<a
			href={ originalUrl }
			onClick={ onClick ?? undefined }
			data-activity={ activity ?? meta.activity }
			data-section={ section ?? meta.section }
			data-intent={ intent ?? meta.intent }
			target="_blank"
			rel="noopener noreferrer"
		>
			{ children }
		</a>
	);
};

const FilePath = ( { children }: { children: ReactNode } ) => (
	<span>
		<code>{ children }</code>
	</span>
);

const Post: BlockRenderer = ( { content, children, onClick } ) => {
	if ( isJetpackCloud() || isA8CForAgencies() ) {
		return <Fragment>{ children }</Fragment>;
	}

	const { siteId, postId, isTrashed } = content as ActivityBlockNode & {
		siteId?: number | string;
		postId?: number | string;
		isTrashed?: boolean;
	};

	if ( ! siteId ) {
		return <Fragment>{ children }</Fragment>;
	}

	const href = isTrashed
		? `/posts/${ siteId }/trash`
		: `/reader/blogs/${ siteId }/posts/${ postId }`;

	return (
		<a href={ href } onClick={ onClick ?? undefined }>
			{ children }
		</a>
	);
};

const Comment: BlockRenderer = ( { content, children, onClick } ) => {
	if ( isJetpackCloud() || isA8CForAgencies() ) {
		return <Fragment>{ children }</Fragment>;
	}

	const { siteId, postId, commentId } = content as ActivityBlockNode & {
		siteId?: number | string;
		postId?: number | string;
		commentId?: number | string;
	};

	if ( ! siteId || ! postId || ! commentId ) {
		return <Fragment>{ children }</Fragment>;
	}

	return (
		<a
			href={ `/reader/blogs/${ siteId }/posts/${ postId }#comment-${ commentId }` }
			onClick={ onClick ?? undefined }
		>
			{ children }
		</a>
	);
};

const Person: BlockRenderer = ( { content, children, onClick, meta } ) => {
	if ( isJetpackCloud() || isA8CForAgencies() ) {
		return <strong>{ children }</strong>;
	}

	const { siteId, name, activity, intent, section } = content as ActivityBlockNode & {
		siteId?: number | string;
		name?: string;
		activity?: string;
		intent?: string;
		section?: string;
	};

	if ( ! siteId || ! name ) {
		return <strong>{ children }</strong>;
	}

	return (
		<a
			href={ `/people/edit/${ siteId }/${ name }` }
			onClick={ onClick ?? undefined }
			data-activity={ activity ?? meta.activity }
			data-section={ section ?? meta.section ?? 'users' }
			data-intent={ intent ?? meta.intent ?? 'edit' }
		>
			<strong>{ children }</strong>
		</a>
	);
};

const Plugin: BlockRenderer = ( { content, children, onClick, meta } ) => {
	if ( isJetpackCloud() || isA8CForAgencies() ) {
		return <Fragment>{ children }</Fragment>;
	}

	const { siteSlug, pluginSlug, activity, section, intent } = content as ActivityBlockNode & {
		siteSlug?: string;
		pluginSlug?: string;
		activity?: string;
		section?: string;
		intent?: string;
	};

	if ( ! siteSlug || ! pluginSlug ) {
		return <Fragment>{ children }</Fragment>;
	}

	return (
		<a
			href={ `/plugins/${ pluginSlug }/${ siteSlug }` }
			onClick={ onClick ?? undefined }
			data-activity={ activity ?? meta.activity }
			data-section={ section ?? meta.section ?? 'plugins' }
			data-intent={ intent ?? meta.intent ?? 'view' }
		>
			{ children }
		</a>
	);
};

const Theme: BlockRenderer = ( { content, children, onClick, meta } ) => {
	const { themeUri, themeSlug, siteSlug, activity, intent, section } =
		content as ActivityBlockNode & {
			themeUri?: string;
			themeSlug?: string;
			siteSlug?: string;
			activity?: string;
			intent?: string;
			section?: string;
		};

	if ( ! themeUri ) {
		return <Fragment>{ children }</Fragment>;
	}

	if ( /wordpress\.com/.test( themeUri ) ) {
		if ( isJetpackCloud() || isA8CForAgencies() ) {
			return <Fragment>{ children }</Fragment>;
		}

		if ( ! themeSlug || ! siteSlug ) {
			return <Fragment>{ children }</Fragment>;
		}

		return (
			<a
				href={ `/theme/${ themeSlug }/${ siteSlug }` }
				onClick={ onClick ?? undefined }
				data-activity={ activity ?? meta.activity }
				data-section={ section ?? meta.section ?? 'themes' }
				data-intent={ intent ?? meta.intent ?? 'view' }
			>
				{ children }
			</a>
		);
	}

	return (
		<a
			href={ themeUri }
			target="_blank"
			rel="noopener noreferrer"
			onClick={ onClick ?? undefined }
			data-activity={ activity ?? meta.activity }
			data-section={ section ?? meta.section ?? 'themes' }
			data-intent={ intent ?? meta.intent ?? 'view' }
		>
			{ children }
		</a>
	);
};

const Backup: BlockRenderer = ( { content, children, onClick, meta } ) => {
	const { url, siteSlug, activity, intent, section } = content as ActivityBlockNode & {
		url?: string;
		siteSlug?: string;
		activity?: string;
		intent?: string;
		section?: string;
	};

	const href = url ?? ( siteSlug ? `/backup/${ siteSlug }` : null );

	if ( ! href ) {
		return <Fragment>{ children }</Fragment>;
	}

	return (
		<a
			href={ href }
			onClick={ onClick ?? undefined }
			data-activity={ activity ?? meta.activity }
			data-section={ section ?? meta.section ?? 'backups' }
			data-intent={ intent ?? meta.intent ?? 'view' }
		>
			{ children }
		</a>
	);
};

const blockTypeMapping: Record< string, BlockRenderer > = {
	b: ( { children } ) => <Strong>{ children }</Strong>,
	strong: ( { children } ) => <Strong>{ children }</Strong>,
	i: ( { children } ) => <Emphasis>{ children }</Emphasis>,
	em: ( { children } ) => <Emphasis>{ children }</Emphasis>,
	pre: ( { children } ) => <Preformatted>{ children }</Preformatted>,
	a: Link,
	link: Link,
	filepath: ( { children } ) => <FilePath>{ children }</FilePath>,
	post: Post,
	comment: Comment,
	person: Person,
	plugin: Plugin,
	theme: Theme,
	backup: Backup,
};

const createFormattedBlock = ( mapping: Record< string, BlockRenderer > ) => {
	const FormattedBlock = ( { content, onClick, meta }: FormattedBlockProps ): ReactNode => {
		if ( typeof content === 'string' ) {
			return <>{ content }</>;
		}

		const nestedContent = content.children ?? [];
		const { type, text } = content;

		if ( type === undefined && nestedContent.length === 0 ) {
			return text ? <>{ text }</> : null;
		}

		const children = nestedContent.map( ( child, index ) => (
			<FormattedBlock key={ index } content={ child } onClick={ onClick } meta={ meta } />
		) );

		if ( type ) {
			const renderer = mapping[ type ];
			if ( renderer ) {
				return renderer( { content, children, onClick, meta } );
			}
		}

		return <>{ children }</>;
	};

	return FormattedBlock;
};

const FormattedBlock = createFormattedBlock( blockTypeMapping );

export const renderFormattedContent = ( {
	items,
	onClick = null,
	meta = {},
}: {
	items: ActivityBlockContent[];
	onClick?: BlockClickHandler | null;
	meta?: ActivityBlockMeta;
} ): ReactNode[] =>
	items.map( ( item, index ) => (
		<FormattedBlock key={ index } content={ item } onClick={ onClick ?? null } meta={ meta } />
	) );

export default FormattedBlock;
