/**
 * External Dependencies
 */
import React from 'react';
import { map } from 'lodash';
import { localize } from 'i18n-calypso';

const BlogStickersList = ( { stickers } ) => {
	return (
		<div className="blog-stickers__list">
			<h3 className="blog-stickers__list-title">Blog stickers</h3>
			<ul className="blog-stickers__list-ul">
				{ map( stickers, sticker => {
					const key = `blog-sticker-${ sticker }`;
					return <li className="blog-stickers__list-item" key={ key }>{ sticker }</li>;
				} ) }
			</ul>
		</div>
	);
};

export default localize( BlogStickersList );
