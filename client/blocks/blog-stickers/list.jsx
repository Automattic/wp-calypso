/**
 * External Dependencies
 */
import React from 'react';
import { map } from 'lodash';

const BlogStickersList = ( { stickers } ) => {
	return (
		<ul className="blog-stickers__list">
			{ map( stickers, sticker => {
				const key = `blog-sticker-${ sticker }`;
				return <li key={ key }>{ sticker }</li>;
			} ) }
		</ul>
	);
};

export default BlogStickersList;
