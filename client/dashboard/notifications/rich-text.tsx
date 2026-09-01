import { __experimentalText as Text, Button } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { Fragment } from 'react';
import { getNoticonIcon } from './note-icons';
import { getRichNodes } from './note-model';
import type { NoteBlock, RichNode, TitleSegment } from './note-model';

const RICH_TAGS: Partial< Record< string, keyof React.JSX.IntrinsicElements > > = {
	b: 'strong',
	strong: 'strong',
	i: 'em',
	em: 'em',
	blockquote: 'blockquote',
	cite: 'cite',
	code: 'code',
	pre: 'pre',
	p: 'p',
	div: 'div',
	span: 'span',
	sub: 'sub',
	sup: 'sup',
	del: 'del',
	s: 's',
	ol: 'ol',
	ul: 'ul',
	li: 'li',
	h1: 'h1',
	h2: 'h2',
	h3: 'h3',
	h4: 'h4',
	h5: 'h5',
	h6: 'h6',
	figure: 'figure',
	figcaption: 'figcaption',
	br: 'br',
	hr: 'hr',
};

export function RichNodeView( { node }: { node: RichNode } ) {
	switch ( node.kind ) {
		case 'text':
			return <>{ node.text }</>;
		case 'icon':
			return <Icon icon={ getNoticonIcon( node.value ) } size={ 16 } />;
		case 'image': {
			let imageClass = 'dashboard-notifications-inbox__body-image';
			if ( node.imageType === 'badge' ) {
				imageClass = 'dashboard-notifications-inbox__badge-media';
			} else if ( node.url.includes( '/i/emojis/' ) ) {
				imageClass = 'dashboard-notifications-inbox__body-emoji';
			}
			return <img className={ imageClass } src={ node.url } alt={ node.alt } />;
		}
		case 'element': {
			const children = node.children.map( ( child, index ) => (
				<RichNodeView key={ index } node={ child } />
			) );
			if ( node.type === 'button' && node.url ) {
				return (
					<Button variant="primary" href={ node.url } target="_blank" rel="noreferrer">
						{ children }
					</Button>
				);
			}
			if ( node.url ) {
				return (
					<a href={ node.url } target="_blank" rel="noreferrer">
						{ children }
					</a>
				);
			}
			const Tag = RICH_TAGS[ node.type ];
			if ( Tag === 'br' || Tag === 'hr' ) {
				return <Tag />;
			}
			if ( Tag ) {
				return <Tag>{ children }</Tag>;
			}
			return <>{ children }</>;
		}
	}
}

/** A body block's text with its ranges and media rendered. */
export function BlockText( { block }: { block: NoteBlock } ) {
	return (
		<>
			{ getRichNodes( block ).map( ( node, index ) => (
				<RichNodeView key={ index } node={ node } />
			) ) }
		</>
	);
}

/** Title-style segments: bold names, links where the range carries one. */
export function TitleText( {
	segments,
	children,
}: {
	segments: TitleSegment[];
	children?: React.ReactNode;
} ) {
	return (
		<Text className="dashboard-notifications-inbox__note-title">
			{ segments.map( ( segment, index ) => {
				const text = segment.bold ? <strong>{ segment.text }</strong> : segment.text;
				return segment.url ? (
					<a key={ index } href={ segment.url } target="_blank" rel="noreferrer">
						{ text }
					</a>
				) : (
					<Fragment key={ index }>{ text }</Fragment>
				);
			} ) }
			{ children }
		</Text>
	);
}
