import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import ExternalLink from 'calypso/components/external-link';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import JetpackInstructionList from './jetpack-instruction-list';
import { getWPORGPluginLink } from './utils';

interface Props {
	product: SelectorProduct;
}

const JetpackStandaloneActivationInstructions: React.FC< Props > = ( { product } ) => {
	const translate = useTranslate();

	const wporgPluginLink = getWPORGPluginLink( product.productSlug );

	const items = useMemo(
		() => [
			translate( 'Login to an existing Wordpress site as an administrator.' ),
			translate( 'Go to {{strong}}Plugins > Add New{{/strong}} in the admin menu.', {
				components: { strong: <strong /> },
			} ),
			translate(
				'Search for {{link}}{{strong}}Jetpack %(pluginName)s{{/strong}}{{/link}}, install and activate.',
				{
					components: {
						strong: <strong />,
						link: (
							<Button plain href={ wporgPluginLink } target="_blank" rel="noreferrer noopener" />
						),
					},
					args: { pluginName: product.shortName },
				}
			),
		],
		[ translate, product, wporgPluginLink ]
	);

	return (
		<>
			<JetpackInstructionList items={ items } />
			<p>
				<ExternalLink
					href="https://jetpack.com/support/install-jetpack-and-connect-your-new-plan/"
					icon
				>
					{ translate( 'Learn more about how to install Jetpack %(pluginName)s', {
						args: { pluginName: product.shortName },
					} ) }
				</ExternalLink>
			</p>
		</>
	);
};

export default JetpackStandaloneActivationInstructions;
