import { Gridicon } from '@automattic/components';
import {
	__experimentalText as Text,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import createStagingSiteIllustration from './create-staging-site-illustration.svg';
import { StagingSiteBannerWrapper } from './staging-site-banner-wrapper';
import './style.scss';

export function StagingSiteCreationBanner() {
	const heading = __( 'Creating staging site' );

	return (
		<StagingSiteBannerWrapper>
			<HStack spacing={ 4 }>
				<VStack>
					<Heading level={ 1 } weight={ 500 }>
						{ heading }
					</Heading>
					<Text as="p" variant="muted">
						{ __(
							"We're currently creating your staging site. This may take a few moments, depending on the size of your site. You'll receive an email once it's ready."
						) }
					</Text>

					<HStack justify="start">
						<Gridicon icon="checkmark" className="staging-site-transfer-banner__checkmark" />
						<Text as="p" variant="muted">
							{ __( "Copying your existing site's content" ) }
						</Text>
					</HStack>
					<HStack justify="start">
						<Gridicon icon="checkmark" className="staging-site-transfer-banner__checkmark" />
						<Text as="p" variant="muted">
							{ __( 'Moving settings, and structure' ) }
						</Text>
					</HStack>
					<HStack justify="start">
						<Gridicon icon="checkmark" className="staging-site-transfer-banner__checkmark" />
						<Text as="p" variant="muted">
							{ __( 'Creating a safe environment' ) }
						</Text>
					</HStack>
				</VStack>
				<img src={ createStagingSiteIllustration } alt={ heading } />
			</HStack>
		</StagingSiteBannerWrapper>
	);
}
