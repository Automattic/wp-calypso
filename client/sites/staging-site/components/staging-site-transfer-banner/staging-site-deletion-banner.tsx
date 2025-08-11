import {
	__experimentalText as Text,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import deleteStagingSiteIllustration from './delete-staging-site-illustration.svg';
import { StagingSiteBannerWrapper } from './staging-site-banner-wrapper';

export function StagingSiteDeletionBanner() {
	const heading = __( 'Deleting staging site' );

	return (
		<StagingSiteBannerWrapper>
			<HStack spacing={ 4 }>
				<VStack>
					<Heading level={ 1 } weight={ 500 }>
						{ heading }
					</Heading>
					<Text as="p" variant="muted">
						{ __(
							"We're permanently deleting your staging site. Your live site is safe and won't be affected."
						) }
					</Text>
					<Text as="p" variant="muted">
						{ __( 'Hang tight, this may take a few moments.' ) }
					</Text>
				</VStack>
				<img src={ deleteStagingSiteIllustration } alt={ heading } />
			</HStack>
		</StagingSiteBannerWrapper>
	);
}
