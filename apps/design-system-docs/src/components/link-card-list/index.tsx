import { LinkCard } from '../link-card';
import styles from './style.module.scss';

export const LinkCardList = ( { items }: { items: React.ComponentProps< typeof LinkCard >[] } ) => {
	return (
		<ul className={ styles[ 'link-card-list' ] }>
			{ items.map( ( item ) => (
				<li key={ item.href }>
					<LinkCard className={ styles[ 'link-card-list__card' ] } { ...item } />
				</li>
			) ) }
		</ul>
	);
};

export const LinkCardListFromMdx = ( {
	mdxFiles,
}: {
	/**
	 * Object of imported mdx files with metadata.
	 */
	mdxFiles: Record<
		string,
		{
			metadata: {
				permalink: string;
				title: string;
				description?: string;
				frontMatter: { image?: string };
			};
			assets: { image?: string };
		}
	>;
} ) => {
	const items = Object.values( mdxFiles ).map( ( { metadata, assets } ) => {
		return {
			href: metadata.permalink,
			label: metadata.title,
			description: metadata.description,
			image: assets.image ?? metadata.frontMatter.image,
		};
	} );
	return <LinkCardList items={ items } />;
};
