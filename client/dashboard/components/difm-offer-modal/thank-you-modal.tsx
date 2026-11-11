import { localizeUrl } from '@automattic/i18n-utils';
import { ExternalLink, __experimentalVStack as VStack } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useId } from 'react';
import { Text } from '../text';
import { DifmOfferModalFrame } from './frame';

const DIFM_EXAMPLES_URL = localizeUrl(
	'https://wordpress.com/support/website-design-service/#what-will-my-completed-website-look-like'
);

/**
 * Shown on the site overview after checkout for a plan bought through the DIFM offer.
 */
export default function DifmOfferThankYouModal( { onClose }: { onClose: () => void } ) {
	const titleId = useId();

	return (
		<DifmOfferModalFrame
			className="difm-offer-modal--thank-you"
			labelledBy={ titleId }
			onRequestClose={ onClose }
		>
			<VStack spacing={ 4 }>
				<Text id={ titleId } as="h1" size={ 20 } weight={ 600 } lineHeight="24px">
					{ __( 'Thank you for trusting us!' ) }
				</Text>
				<Text as="p">
					{ __(
						'We’ll review your request to confirm it fits within the scope of our free build offer.'
					) }
				</Text>
				<Text as="p">
					{ createInterpolateElement(
						__(
							'If you submit your request Monday to Friday, you’ll hear from us within 24 hours. If it’s submitted over the weekend, we’ll be in touch the following Monday. In the meantime, feel free to review <link>examples of our work</link>.'
						),
						{ link: <ExternalLink href={ DIFM_EXAMPLES_URL } children={ null } /> }
					) }
				</Text>
				<Text as="p">{ __( 'We’re excited to help you get online — talk soon!' ) }</Text>
			</VStack>
		</DifmOfferModalFrame>
	);
}
