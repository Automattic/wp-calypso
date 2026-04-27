import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import type { AtmosphereEmbedExternal } from '@automattic/api-core';

interface PostCardEmbedExternalProps {
	embed: AtmosphereEmbedExternal;
	// Unused in slice 4's render path, required for the analytics wiring in
	// Task 24. Reserved here so the prop signature stays stable.
	parentPostUri: string;
}

function safeHost( uri: string ): string {
	try {
		return new URL( uri ).host;
	} catch {
		return '';
	}
}

export function PostCardEmbedExternal( { embed }: PostCardEmbedExternalProps ) {
	return (
		<a
			className="social-post-card-embed-external"
			href={ embed.uri }
			target="_blank"
			rel="noopener noreferrer"
		>
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
					<span className="social-post-card-embed-external__description">
						{ embed.description }
					</span>
					<span className="social-post-card-embed-external__host">{ safeHost( embed.uri ) }</span>
				</VStack>
			</HStack>
		</a>
	);
}
