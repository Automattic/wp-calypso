import { Button, Gridicon, ExternalLink } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useCallback } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import JetpackInstructionList from './jetpack-instruction-list';
import JetpackLicenseKeyClipboard from './jetpack-license-key-clipboard';
import { getJetpackPluginSupportDocLink, getWPORGPluginLink } from './utils';

interface Props {
	product: SelectorProduct;
	receiptId: number;
}

const JetpackStandaloneActivationInstructions: React.FC< Props > = ( { product, receiptId } ) => {
	const translate = useTranslate();

	const { productSlug } = product;
	const wporgPluginLink = getWPORGPluginLink( productSlug );

	const handleDownloadClick = useCallback( () => {
		recordTracksEvent( 'calypso_siteless_checkout_manual_activation_download_link_click', {
			product_slug: productSlug,
		} );
	}, [ productSlug ] );
	const handleLearnMoreClick = useCallback( () => {
		recordTracksEvent( 'calypso_siteless_checkout_manual_activation_learn_more_link_click', {
			product_slug: productSlug,
		} );
	}, [ productSlug ] );

	const items = useMemo(
		() => [
			{
				id: 1,
				content: translate( '{{link}}Download Jetpack %(pluginName)s.{{icon/}}{{/link}}', {
					components: {
						strong: <strong />,
						link: (
							<Button
								plain
								href={ wporgPluginLink }
								onClick={ handleDownloadClick }
								target="_blank"
								rel="noreferrer noopener"
							/>
						),
						icon: <Gridicon icon="external" size={ 16 } />,
					},
					args: { pluginName: product.shortName },
				} ),
			},
			{
				id: 2,
				content: translate( 'Install and activate the plugin.' ),
			},
			{
				id: 3,
				content: translate( 'Go to {{strong}}Jetpack > My Jetpack{{/strong}}.', {
					components: { strong: <strong /> },
				} ),
			},
			{
				id: 4,
				content: translate(
					'Click “Activate a license” (at the bottom of the page) and enter the key below.'
				),
			},
		],
		[ translate, product, wporgPluginLink, handleDownloadClick ]
	);

	return (
		<div className="jetpack-standalone-activation-instructions">
			<JetpackInstructionList items={ items } />

			<JetpackLicenseKeyClipboard productSlug={ product.productSlug } receiptId={ receiptId } />

			<p>
				<ExternalLink
					className="jetpack-standalone-activation-instructions__external-link"
					href={ getJetpackPluginSupportDocLink( product.productSlug ) }
					icon
					onClick={ handleLearnMoreClick }
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
