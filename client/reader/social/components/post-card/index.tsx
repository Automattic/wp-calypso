import { Card, CardBody } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
import { PostCardBody } from './post-card-body';
import { PostCardCounts } from './post-card-counts';
import { PostCardEmbed } from './post-card-embed';
import { PostCardHeader } from './post-card-header';
import { PostCardLink } from './post-card-link';
import type { AtmosphereFeedItem } from '@automattic/api-core';

type SocialPostCardVariant = 'default' | 'compact';

interface SocialPostCardProps {
	post: AtmosphereFeedItem;
	variant?: SocialPostCardVariant;
}

function formatRelative( iso: string, translate: ReturnType< typeof useTranslate > ): string {
	if ( ! iso ) {
		return '';
	}
	const ts = Date.parse( iso );
	if ( Number.isNaN( ts ) ) {
		return '';
	}
	const seconds = Math.max( 1, Math.floor( ( Date.now() - ts ) / 1000 ) );
	const out = ( v: TranslateResult ): string => String( v );
	if ( seconds < 60 ) {
		return out(
			translate( '%(n)ds', {
				args: { n: seconds },
				comment: 'Time-ago suffix for seconds, e.g. "30s"',
			} )
		);
	}
	const minutes = Math.floor( seconds / 60 );
	if ( minutes < 60 ) {
		return out(
			translate( '%(n)dm', {
				args: { n: minutes },
				comment: 'Time-ago suffix for minutes, e.g. "5m"',
			} )
		);
	}
	const hours = Math.floor( minutes / 60 );
	if ( hours < 24 ) {
		return out(
			translate( '%(n)dh', {
				args: { n: hours },
				comment: 'Time-ago suffix for hours, e.g. "2h"',
			} )
		);
	}
	const days = Math.floor( hours / 24 );
	return out(
		translate( '%(n)dd', {
			args: { n: days },
			comment: 'Time-ago suffix for days, e.g. "3d"',
		} )
	);
}

export function SocialPostCard( { post, variant = 'default' }: SocialPostCardProps ) {
	const translate = useTranslate();
	const isCompact = variant === 'compact';
	const timestampLabel = formatRelative( post.created_at || post.indexed_at, translate );

	const card = (
		<Card className={ clsx( 'social-post-card', `social-post-card--${ variant }` ) }>
			<CardBody>
				<PostCardHeader post={ post } variant={ variant } timestampLabel={ timestampLabel } />
				<PostCardBody post={ post } />
				{ ! isCompact && post.embed && (
					<PostCardEmbed embed={ post.embed } parentPostUri={ post.uri } />
				) }
				{ ! isCompact && <PostCardCounts counts={ post.counts } /> }
			</CardBody>
		</Card>
	);

	// Compact mode renders without any anchors so the consumer
	// (e.g. PostCardEmbedQuote) can wrap it in its own outer anchor without
	// creating invalid nested-<a> markup.
	if ( isCompact ) {
		return card;
	}

	return <PostCardLink variant={ variant }>{ card }</PostCardLink>;
}
