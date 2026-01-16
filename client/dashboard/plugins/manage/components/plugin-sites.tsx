import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { __, sprintf } from '@wordpress/i18n';
import { Card, CardBody } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import { Text } from '../../../components/text';
import { TextBlur } from '../../../components/text-blur';
import { PluginTabs } from '../../plugin';
import { usePlugin } from '../../plugin/use-plugin';
import { PluginIcon } from './plugin-icon';

import './plugin-sites.scss';

export const PluginSites = ( { selectedPluginSlug }: { selectedPluginSlug: string } ) => {
	const {
		icon,
		isLoading: isLoadingPlugin,
		plugin,
		pluginBySiteId,
		sitesWithThisPlugin,
		sitesWithoutThisPlugin,
	} = usePlugin( selectedPluginSlug );

	const decoration = () => {
		if ( icon ) {
			return <img className="plugin-icon" src={ icon } alt={ plugin?.name } />;
		} else if ( isLoadingPlugin ) {
			return <div className="plugin-icon-placeholder" aria-hidden="true" />;
		}

		return <PluginIcon />;
	};

	const title = () => {
		if ( ! isLoadingPlugin && ! plugin ) {
			return __( 'Plugin not found' );
		}

		return plugin ? (
			// @ts-expect-error: Can only set one of `children` or `props.dangerouslySetInnerHTML`.
			<Text dangerouslySetInnerHTML={ { __html: plugin.name } } />
		) : (
			<TextBlur>{ selectedPluginSlug }</TextBlur>
		);
	};

	const description = () => {
		if ( ( ! isLoadingPlugin && ! plugin ) || ! plugin?.author ) {
			return null;
		}

		const authorUrl = 'author_url' in plugin ? plugin.author_url : null;

		return authorUrl
			? createInterpolateElement(
					sprintf(
						// translators: author is the plugin author.
						__( 'By <link>%(author)s</link>' ),
						{ author: decodeEntities( plugin.author ) }
					),
					{
						link: <ExternalLink href={ authorUrl } children={ null } />,
					}
			  )
			: sprintf(
					// translators: author is the plugin author.
					__( 'By %(author)s' ),
					{ author: decodeEntities( plugin.author ) }
			  );
	};

	return (
		<Card>
			<CardBody className="plugin-sites-card-body">
				<SectionHeader
					className="plugin-sites-card-header"
					decoration={ decoration() }
					level={ 2 }
					title={ title() }
					description={ description() }
				/>

				<PluginTabs
					pluginSlug={ selectedPluginSlug }
					isLoading={ isLoadingPlugin }
					plugin={ plugin }
					pluginName={ plugin?.name }
					pluginBySiteId={ pluginBySiteId }
					sitesWithThisPlugin={ sitesWithThisPlugin }
					sitesWithoutThisPlugin={ sitesWithoutThisPlugin }
				/>
			</CardBody>
		</Card>
	);
};
