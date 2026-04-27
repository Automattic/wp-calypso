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
		return out( translate( '%(n)ds', { args: { n: seconds } } ) );
	}
	const minutes = Math.floor( seconds / 60 );
	if ( minutes < 60 ) {
		return out( translate( '%(n)dm', { args: { n: minutes } } ) );
	}
	const hours = Math.floor( minutes / 60 );
	if ( hours < 24 ) {
		return out( translate( '%(n)dh', { args: { n: hours } } ) );
	}
	const days = Math.floor( hours / 24 );
	return out( translate( '%(n)dd', { args: { n: days } } ) );
}

export function SocialPostCard( { post, variant = 'default' }: SocialPostCardProps ) {
	const translate = useTranslate();
	const isCompact = variant === 'compact';
	const timestampLabel = formatRelative( post.created_at || post.indexed_at, translate );
	return (
		<PostCardLink post={ post } variant={ variant } timestampLabel={ timestampLabel }>
			<Card className={ clsx( 'social-post-card', `social-post-card--${ variant }` ) }>
				<CardBody>
					<PostCardHeader post={ post } variant={ variant } />
					<PostCardBody post={ post } />
					{ ! isCompact && post.embed && (
						<PostCardEmbed embed={ post.embed } parentPostUri={ post.uri } />
					) }
					{ ! isCompact && <PostCardCounts counts={ post.counts } /> }
				</CardBody>
			</Card>
		</PostCardLink>
	);
}
