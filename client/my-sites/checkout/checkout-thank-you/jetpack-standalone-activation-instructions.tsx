import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import ExternalLink from 'calypso/components/external-link';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';

interface Props {
	product: SelectorProduct;
}

const JetpackStandaloneActivationInstructions: FC< Props > = ( { product } ) => {
	const translate = useTranslate();
	return (
		<>
			<ul className="licensing-thank-you-manual-activation-instructions__list">
				<li className="licensing-thank-you-manual-activation-instructions__list-item">
					<span className="licensing-thank-you-manual-activation-instructions__step-number">1</span>
					<span>{ translate( 'Login to an existing Wordpress site as an administrator.' ) }</span>
				</li>

				<li className="licensing-thank-you-manual-activation-instructions__list-item">
					<span className="licensing-thank-you-manual-activation-instructions__step-number">2</span>
					<span>
						{ translate(
							'Go to {{strong}}Plugins > add New{{/strong}} in the admin menu on the left hand side.',
							{
								components: { strong: <strong /> },
							}
						) }
					</span>
				</li>

				<li className="licensing-thank-you-manual-activation-instructions__list-item">
					<span className="licensing-thank-you-manual-activation-instructions__step-number">3</span>
					<span>
						{ translate(
							'Search for {{strong}}Jetpack %(pluginName)s{{/strong}}, install and activate.',
							{
								components: { strong: <strong /> },
								args: { pluginName: product.shortName },
							}
						) }
					</span>
				</li>
			</ul>

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
