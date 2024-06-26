import { Card } from '@automattic/components';
import { type SiteDetails } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { SubTitle, Title } from '@automattic/onboarding';
import {
	CardBody,
	FlexItem,
	Flex,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { Link } from 'react-router-dom';
import './style.scss';

interface MigrationSuccessProps {
	recordTracksEvent: ( eventName: string, eventProperties?: object ) => void;
	targetSite: SiteDetails;
}

const redirect = ( url: string, isWpAdmin = false ): void => {
	const finalUrl = isWpAdmin ? `${ url }/wp-admin` : url;
	window.location.href = finalUrl;
};

export default function MigrationSuccess( {
	targetSite,
	recordTracksEvent,
}: MigrationSuccessProps ) {
	const { __ } = useI18n();
	const navigateToSite =
		( url: string, isWpAdmin = false ) =>
		( e: React.MouseEvent< HTMLButtonElement > ): void => {
			e.preventDefault();
			isWpAdmin
				? recordTracksEvent( 'calypso_site_importer_navigate_wp_admin' )
				: recordTracksEvent( 'calypso_site_importer_navigate_site' );
			redirect( url, isWpAdmin );
		};

	return (
		<>
			<Title> { __( 'Say hello to your new home' ) } </Title>
			<SubTitle>{ __( 'All set! Your content was successfully imported.' ) }</SubTitle>

			<Card size="small">
				<CardBody>
					<HStack spacing={ 3 } justify="space-between">
						<Flex
							className="migration-success__ctas"
							direction={ [ 'column', 'row' ] }
							expanded
							align="center"
						>
							<FlexItem>
								<p className="migration-success__site">{ targetSite.domain }</p>
							</FlexItem>

							<FlexItem className="migration-success-ctas__buttons">
								<Flex gap={ 4 }>
									<Button variant="primary" onClick={ navigateToSite( targetSite.URL ) }>
										{ __( 'View site' ) }
									</Button>
									<Button variant="secondary" onClick={ navigateToSite( targetSite.URL, true ) }>
										{ __( 'Go to WP Admin' ) }
									</Button>
								</Flex>
							</FlexItem>
						</Flex>
					</HStack>
				</CardBody>
			</Card>

			<Flex
				className="migration-success-links-wrapper"
				direction={ [ 'column', 'row' ] }
				gap={ 10 }
			>
				<VStack
					spacing="1"
					className="screen-confirmation__list-item-wrapper"
					justify="space-between"
				>
					<strong className="screen-confirmation__list-item-title">
						{ __( 'Manage your site from anywhere' ) }
					</strong>
					<p className="screen-confirmation__list-item-description">
						{ __(
							'The Jetpack mobile app for iOS and Android makes managing your email, domain, and website even simpler.'
						) }
					</p>
					<Link
						className="migration-success-links-wrapper__link"
						to={ localizeUrl( 'https://apps.wordpress.com/mobile/' ) }
						target="_blank"
						rel="noopener noreferrer"
						title={ __( 'Get the app' ) }
					>
						{ __( 'Get the app' ) }
					</Link>
				</VStack>

				<VStack
					spacing="1"
					className="screen-confirmation__list-item-wrapper"
					justify="space-between"
				>
					<strong className="screen-confirmation__list-item-title">
						{ __( 'Migration questions? Find answers' ) }
					</strong>
					<p className="screen-confirmation__list-item-description">
						{ __(
							'Explore our comprehensive support guides and find solutions to all your email inquiries.'
						) }
					</p>
					<Link
						className="migration-success-links-wrapper__link"
						to={ localizeUrl(
							'https://wordpress.com/support/import/import-a-sites-content/#after-importing'
						) }
						target="_blank"
						rel="noopener noreferrer"
						title={ __( 'Migration support resources' ) }
					>
						{ __( 'Migration support resources' ) }
					</Link>
				</VStack>
			</Flex>
		</>
	);
}
