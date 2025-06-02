import { __experimentalText as Text } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { SiteResetContentSummary } from '../../data/types';

interface ContentItem {
	text: string;
	url?: string;
}

type ContentType = [ keyof SiteResetContentSummary, string, string ];

export default function ContentInfo( {
	siteContent,
	siteDomain,
}: {
	siteContent: SiteResetContentSummary;
	siteDomain: string;
} ) {
	const types: ContentType[] = [
		[ 'post_count', 'post', `/posts/${ siteDomain }` ],
		[ 'page_count', 'page', `/pages/${ siteDomain }` ],
		[ 'media_count', 'media item', `/media/${ siteDomain }` ],
		[ 'plugin_count', 'plugin', `https://${ siteDomain }/wp-admin/plugins.php` ],
	];

	const content: ContentItem[] = types
		.filter( ( [ key ]: ContentType ) => siteContent[ key ] > 0 )
		.map( ( [ key, label, url ]: ContentType ): ContentItem => {
			const count: number = siteContent[ key ];
			const text: string = sprintf(
				/* translators: %(count)d: number of items, %(label)s: content type label (post, page) */
				_n( '%(count)d %(label)s', '%(count)d %(label)ss', count ),
				{
					count,
					label,
				}
			);
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
