import { SiteResetContentSummary } from '@automattic/api-core';
import { formatNumber } from '@automattic/number-formatters';
import { __experimentalText as Text } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { wpcomLink } from '../../utils/link';

interface ContentItem {
	text: string;
	url?: string;
}

export default function ContentInfo( {
	siteContent,
	siteDomain,
}: {
	siteContent: SiteResetContentSummary;
	siteDomain: string;
} ) {
	const types = [
		[
			'post_count',
			/* translators: %s: formatted number of posts. */
			_n( '%s post', '%s posts', siteContent.post_count ),
			wpcomLink( `/posts/${ siteDomain }` ),
		],
		[
			'page_count',
			/* translators: %s: formatted number of pages. */
			_n( '%s page', '%s pages', siteContent.page_count ),
			wpcomLink( `/pages/${ siteDomain }` ),
		],
		[
			'media_count',
			/* translators: %s: formatted number of media items. */
			_n( '%s media item', '%s media items', siteContent.media_count ),
			wpcomLink( `/media/${ siteDomain }` ),
		],
		[
			'plugin_count',
			/* translators: %s: formatted number of plugins. */
			_n( '%s plugin', '%s plugins', siteContent.plugin_count ),
			`https://${ siteDomain }/wp-admin/plugins.php`,
		],
	] as const;

	const content: ContentItem[] = types
		.filter( ( [ key ] ) => siteContent[ key ] > 0 )
		.map( ( [ key, template, url ] ): ContentItem => {
			const count: number = siteContent[ key ];
			const text: string = sprintf( template, formatNumber( count ) );
			return { text, url };
		} );

	if ( ! content.length ) {
		return null;
	}

	return (
		<>
			<Text>{ __( 'The following content will be removed:' ) }</Text>
			<ul style={ { margin: 0, paddingLeft: '24px' } }>
				{ content.map( ( { text, url } ) => {
					if ( url ) {
						return (
							<li key={ text }>
								<a style={ { fontSize: '13px' } } href={ url }>
									{ text }
								</a>
							</li>
						);
					}
					return <li key={ text }>{ text }</li>;
				} ) }
			</ul>
		</>
	);
}
