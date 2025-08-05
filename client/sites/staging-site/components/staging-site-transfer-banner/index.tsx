import { Gridicon } from '@automattic/components';
import {
	__experimentalText as Text,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Card,
	CardBody,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import createStagingSiteIllustration from './create-staging-site-illustration.svg';
import deleteStagingSiteIllustration from './delete-staging-site-illustration.svg';
import stagingSiteTransferBackground from './staging-site-transfer-banner-background.svg';
import './style.scss';

type StagingSiteTransferBannerProps = {
	isDeletion: boolean;
};

export default function StagingSiteTransferBanner( {
	isDeletion,
}: StagingSiteTransferBannerProps ) {
	const illustration = isDeletion ? deleteStagingSiteIllustration : createStagingSiteIllustration;
	const heading = isDeletion ? __( 'Deleting staging site' ) : __( 'Creating staging site' );

	return (
		<Card
			style={ {
				margin: '40px',
			} }
		>
			<CardBody
				style={ {
					padding: '40px',
					background: `
							linear-gradient(
								to right,
								rgba( 255, 255, 255, 1 ) 0%,
								rgba( 255, 255, 255, 0.41 ) 59%,
								rgba( 255, 255, 255, 0 ) 100%
							),
							url(${ stagingSiteTransferBackground }) repeat
						`,
				} }
			>
				<HStack spacing={ 4 }>
					<VStack>
						<Heading level={ 1 } weight={ 500 }>
							{ heading }
						</Heading>
						{ isDeletion ? (
							<>
								<Text as="p" variant="muted">
									{ __(
										"We're permanently deleting your staging site. Your live site is safe and won't be affected."
									) }
								</Text>
								<Text as="p" variant="muted">
									{ __( 'Hang tight, this may take a few moments.' ) }
								</Text>
							</>
						) : (
							<>
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
							</>
						) }
					</VStack>
					<img src={ illustration } alt={ heading } />
				</HStack>
			</CardBody>
		</Card>
	);
}
