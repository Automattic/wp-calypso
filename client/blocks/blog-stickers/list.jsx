/**
 * External dependencies
 */

import React from 'react';
import { map } from 'lodash';
import { localize } from 'i18n-calypso';

const BlogStickersList = ( { stickers, translate } ) => {
	return (
		<div className="blog-stickers__list">
			<h3 className="blog-stickers__list-title">{ translate( 'Blog Stickers' ) }</h3>
			<ul className="blog-stickers__list-ul">
				{ map( stickers, ( sticker ) => {
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

export default localize( BlogStickersList );
