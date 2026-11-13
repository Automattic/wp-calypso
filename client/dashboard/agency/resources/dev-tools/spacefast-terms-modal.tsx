import {
	Modal,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * The Spacefast launch offer's terms, condensed from Legal's blurb for the
 * partner email, so the card itself can stay short.
 */
export default function SpacefastTermsModal( { onClose }: { onClose: () => void } ) {
	const terms = [
		__( 'Open to Automattic for Agencies partners in good standing, with one trial per partner.' ),
		__(
			'You get 30 days of Spacefast Pro free, plus 30 more days when you build a space during the trial.'
		),
		__(
			'There’s no charge and nothing to cancel. When the trial ends, your account switches to a free personal plan automatically.'
		),
		__(
			'You’ll lose access to any spaces the personal plan doesn’t support, but they won’t be deleted, and upgrading restores access.'
		),
		__(
			'Your work stays yours. We won’t feature, share, or do anything with your spaces without your written permission. If a space you build during the second 30 days catches our eye, we may ask whether you’d like a co-marketing feature. Features are optional, unpaid, and never guaranteed.'
		),
		__( 'Automattic may change or end this offer at any time.' ),
	];

	return (
		<Modal title={ __( 'Spacefast offer terms' ) } size="medium" onRequestClose={ onClose }>
			<VStack as="ul" spacing={ 3 } className="a4a-spacefast-terms">
				{ terms.map( ( term ) => (
					<Text as="li" key={ term } size={ 15 } lineHeight="24px">
						{ term }
					</Text>
				) ) }
			</VStack>
		</Modal>
	);
}
