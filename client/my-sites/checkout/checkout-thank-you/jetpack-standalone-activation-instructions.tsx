import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import ExternalLink from 'calypso/components/external-link';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import JetpackInstructionList from './jetpack-instruction-list';
import JetpackLicenseKeyClipboard from './jetpack-license-key-clipboard';
import { getWPORGPluginLink } from './utils';

interface Props {
	product: SelectorProduct;
	receiptId: number;
}

const JetpackStandaloneActivationInstructions: React.FC< Props > = ( { product, receiptId } ) => {
	const translate = useTranslate();

	const wporgPluginLink = getWPORGPluginLink( product.productSlug );

	const items = useMemo(
		() => [
			translate( '{{link}}Download Jetpack %(pluginName)s {{icon/}} {{/link}}', {
				components: {
					strong: <strong />,
					link: <Button plain href={ wporgPluginLink } target="_blank" rel="noreferrer noopener" />,
					icon: <Gridicon icon="external" size={ 16 } />,
				},
				args: { pluginName: product.shortName },
			} ),
			translate( 'Install and activate the plugin' ),
			translate( 'Go to {{strong}}Jetpack > Dashboard > My Jetpack{{/strong}}', {
				components: { strong: <strong /> },
			} ),
			translate(
				'Click the “activate license key” (at the bottom of the page) and enter the key below.'
			),
		],
		[ translate, product, wporgPluginLink ]
	);

	return (
		<div className="jetpack-standalone-activation-instructions">
			<JetpackInstructionList items={ items } />

			<JetpackLicenseKeyClipboard productSlug={ product.productSlug } receiptId={ receiptId } />

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
		</div>
	);
};

export default JetpackStandaloneActivationInstructions;
