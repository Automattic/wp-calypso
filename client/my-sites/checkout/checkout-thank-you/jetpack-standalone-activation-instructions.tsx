import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import ExternalLink from 'calypso/components/external-link';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import { getWPORGPluginLink } from './utils';

interface Props {
	product: SelectorProduct;
}

const JetpackStandaloneActivationInstructions: React.FC< Props > = ( { product } ) => {
	const translate = useTranslate();

	const wporgPluginLink = getWPORGPluginLink( product.productSlug );

	return (
		<>
			<ol className="licensing-thank-you-manual-activation-instructions__list">
				<li className="licensing-thank-you-manual-activation-instructions__list-item">
					{ translate( 'Login to an existing Wordpress site as an administrator.' ) }
				</li>

				<li className="licensing-thank-you-manual-activation-instructions__list-item">
					{ translate( 'Go to {{strong}}Plugins > Add New{{/strong}} in the admin menu.', {
						components: { strong: <strong /> },
					} ) }
				</li>

				<li className="licensing-thank-you-manual-activation-instructions__list-item">
					{ translate(
						'Search for {{link}}{{strong}}Jetpack %(pluginName)s{{/strong}}{{/link}}, install and activate.',
						{
							components: {
								strong: <strong />,
								link: (
									<Button
										plain
										href={ wporgPluginLink }
										target="_blank"
										rel="noreferrer noopener"
									/>
								),
							},
							args: { pluginName: product.shortName },
						}
					) }
				</li>
			</ol>

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
