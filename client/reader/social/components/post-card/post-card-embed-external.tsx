import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useSocialAnalytics } from './analytics-context';
import type { AtmosphereEmbedExternal } from '@automattic/api-core';

interface PostCardEmbedExternalProps {
	embed: AtmosphereEmbedExternal;
	parentPostUri: string;
	compact?: boolean;
}

function safeHost( uri: string ): string {
	try {
		return new URL( uri ).host;
	} catch {
		return '';
	}
}

export function PostCardEmbedExternal( {
	embed,
	parentPostUri,
	compact,
}: PostCardEmbedExternalProps ) {
	const analytics = useSocialAnalytics();
	const handleClick = () => {
		if ( ! analytics ) {
			return;
		}
		analytics.onClick( `calypso_reader_${ analytics.source }_timeline_external_clicked`, {
			connection_id: analytics.connectionId,
			post_uri: parentPostUri,
			external_uri: embed.uri,
		} );
	};

	const body = (
		<HStack alignment="flex-start" spacing={ 3 } justify="flex-start">
			{ embed.thumb && (
				<img
					className="social-post-card-embed-external__thumb"
					src={ embed.thumb }
					alt=""
					loading="lazy"
				/>
			) }
			<VStack spacing={ 1 }>
				<span className="social-post-card-embed-external__title">{ embed.title }</span>
				<span className="social-post-card-embed-external__description">{ embed.description }</span>
				<span className="social-post-card-embed-external__host">{ safeHost( embed.uri ) }</span>
			</VStack>
		</HStack>
	);

	if ( compact ) {
		return <div className="social-post-card-embed-external">{ body }</div>;
	}

	return (
		<a
			className="social-post-card-embed-external"
			href={ embed.uri }
			target="_blank"
			rel="noopener noreferrer"
			onClick={ handleClick }
		>
			{ body }
		</a>
	);
}
