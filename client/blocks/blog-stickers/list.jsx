import { useTranslate } from 'i18n-calypso';

const BlogStickersList = ( { stickers = [] } ) => {
	const translate = useTranslate();

	return (
		<div className="blog-stickers__list">
			<h3 className="blog-stickers__list-title">{ translate( 'Blog Stickers' ) }</h3>
			<ul className="blog-stickers__list-ul">
				{ stickers.map( ( sticker ) => {
					return (
						<li className="blog-stickers__list-item" key={ sticker }>
							{ sticker }
						</li>
					);
				} ) }
			</ul>
		</div>
	);
};

export default BlogStickersList;
