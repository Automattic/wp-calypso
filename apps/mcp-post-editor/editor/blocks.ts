import apiFetch from '@wordpress/api-fetch';
import * as audio from '@wordpress/block-library/build-module/audio';
import * as button from '@wordpress/block-library/build-module/button';
import * as buttons from '@wordpress/block-library/build-module/buttons';
import * as code from '@wordpress/block-library/build-module/code';
import * as column from '@wordpress/block-library/build-module/column';
import * as columns from '@wordpress/block-library/build-module/columns';
import * as cover from '@wordpress/block-library/build-module/cover';
import * as gallery from '@wordpress/block-library/build-module/gallery';
import * as group from '@wordpress/block-library/build-module/group';
import * as heading from '@wordpress/block-library/build-module/heading';
import * as html from '@wordpress/block-library/build-module/html';
import * as image from '@wordpress/block-library/build-module/image';
import * as list from '@wordpress/block-library/build-module/list';
import * as listItem from '@wordpress/block-library/build-module/list-item';
import * as missing from '@wordpress/block-library/build-module/missing';
import * as paragraph from '@wordpress/block-library/build-module/paragraph';
import * as preformatted from '@wordpress/block-library/build-module/preformatted';
import * as pullquote from '@wordpress/block-library/build-module/pullquote';
import * as quote from '@wordpress/block-library/build-module/quote';
import * as separator from '@wordpress/block-library/build-module/separator';
import * as spacer from '@wordpress/block-library/build-module/spacer';
import * as table from '@wordpress/block-library/build-module/table';
import * as video from '@wordpress/block-library/build-module/video';
import {
	parse,
	serialize,
	setDefaultBlockName,
	setGroupingBlockName,
	setUnregisteredTypeHandlerName,
} from '@wordpress/blocks';
import '@wordpress/format-library';

// Only the blocks a blog post needs, instead of registerCoreBlocks() and the whole library.
// Unknown blocks, and classic HTML outside any block, parse as core/missing and save unchanged.
[
	audio,
	button,
	buttons,
	code,
	column,
	columns,
	cover,
	gallery,
	group,
	heading,
	html,
	image,
	list,
	listItem,
	missing,
	paragraph,
	preformatted,
	pullquote,
	quote,
	separator,
	spacer,
	table,
	video,
].forEach( ( block ) => block.init() );
setDefaultBlockName( paragraph.name );
setUnregisteredTypeHandlerName( missing.name );
setGroupingBlockName( group.name );

// The page runs on the MCP host's origin, which has no WordPress REST API to ask.
apiFetch.use( () => Promise.reject( new Error( 'The editor makes no REST requests.' ) ) );

// Each top-level block of `content`, serialized as the editor serializes it, so markup from the
// server and from the editor compare equal when the blocks are the same.
export const splitBlocks = ( content: string ) =>
	parse( content ).map( ( block ) => serialize( block ) );

export const joinBlocks = ( blocks: string[] ) => blocks.join( '\n\n' );
