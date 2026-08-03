import { __experimentalVStack as VStack, ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Card, CardBody, CardHeader } from '../../../components/card';
import { Notice } from '../../../components/notice';
import { SectionHeader } from '../../../components/section-header';
import { Text } from '../../../components/text';
import { TextBlur } from '../../../components/text-blur';
import { PluginTabs } from '../../plugin';
import { usePlugin } from '../../plugin/use-plugin';
import { getAllowedPluginActions } from '../../plugin/utils/get-allowed-plugin-actions';
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

	// Core plugins WordPress.com manages (Jetpack/VaultPress/Akismet) can't be
	// deleted; surface a notice explaining why instead of leaving the user guessing.
	const isCoreManagedPlugin = sitesWithThisPlugin.some(
		( site ) => getAllowedPluginActions( site, selectedPluginSlug ).isAutoManagedPlugin
	);

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

		return plugin.authorUrl
			? createInterpolateElement(
					sprintf(
						// translators: author is the plugin author.
						__( 'By <link>%(author)s</link>' ),
						{ author: plugin.author }
					),
					{
						link: <ExternalLink href={ plugin.authorUrl } children={ null } />,
					}
			  )
			: sprintf(
					// translators: author is the plugin author.
					__( 'By %(author)s' ),
					{ author: plugin.author }
			  );
	};

	return (
		<Card className="plugin-sites-card">
			<CardHeader
				className="plugin-sites-card-header"
				isBorderless
				size={ {
					blockStart: 'medium',
					blockEnd: 'none',
					inlineStart: 'medium',
					inlineEnd: 'medium',
				} }
			>
				<VStack spacing={ 4 }>
					<SectionHeader
						decoration={ decoration() }
						level={ 2 }
						title={ title() }
						description={ description() }
					/>
					{ isCoreManagedPlugin && (
						<Notice variant="info">
							{ __(
								'This plugin is managed by WordPress.com and is required for your site to work properly, so it can’t be removed.'
							) }
						</Notice>
					) }
				</VStack>
			</CardHeader>
			<CardBody className="plugin-sites-card-body" size="none">
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
