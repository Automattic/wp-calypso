import { isEnabled } from '@automattic/calypso-config';
import { localizeUrl } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import EmptyContent from 'calypso/components/empty-content';
import { CreateSiteIcon, ImportSiteIcon } from './no-sites-message-icons';

const NoSitesLayout = styled( EmptyContent )`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;

	${ ( { illustration } ) =>
		! illustration && {
			marginBlockStart: '10%',
		} }

	.empty-content__illustration {
		margin-block-end: 30px;
	}
`;

const SecondaryText = styled.p`
	max-width: 550px;
	font-size: 14px;
	margin-block-end: 0px;
`;

const Title = styled.div`
	font-family: 'Recoleta', 'Noto Serif', Georgia, 'Times New Roman', Times, serif;
	font-size: 32px;
	margin-block-end: 20px;
`;

const SetupLink = styled.a( {
	boxSizing: 'border-box',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	padding: '40px 32px 16px 32px',
	gap: '12px',
	background: '#FFFFFF',
	border: '1px solid #DCDCDE',
	borderRadius: '4px',
	transition: '0.25s',

	fontWeight: 500,
	fontSize: '14px',
	lineHeight: '20px',
	color: 'var(--studio-gray-100)',

	'&:hover, &:visited': {
		color: 'var(--studio-gray-100)',
	},

	'&:hover, &:focus': {
		border: '1px solid #A7AAAD',
		boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.12), 0px 3px 1px rgba(0, 0, 0, 0.04)',
	},
} );

type SitesContainerProps = {
	status: string;

	// The number of sites the user has that match the specified status
	statusSiteCount: number;
};

export const NoSitesMessage = ( { status, statusSiteCount }: SitesContainerProps ) => {
	const { __ } = useI18n();

	if ( statusSiteCount > 0 ) {
		// If the user has some number of sites with this status, but the table is
		// still empty, it means the search query must not match any sites.
		return <h2>{ __( 'No sites match your search.' ) }</h2>;
	}

	if ( status === 'public' ) {
		return (
			<NoSitesLayout
				title={ <Title> { __( "You haven't launched a site" ) } </Title> }
				line={
					<SecondaryText>
						{ createInterpolateElement(
							__(
								'Our <a>support center</a> and team are here to help you as you work your way towards launch.'
							),
							{
								a: (
									<a
										href={ localizeUrl( 'https://wordpress.com/support/' ) }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							}
						) }
					</SecondaryText>
				}
				illustration=""
			/>
		);
	}

	if ( status === 'private' ) {
		return (
			<NoSitesLayout
				title={ <Title> { __( 'You have no private sites' ) } </Title> }
				line={
					<SecondaryText>
						{ createInterpolateElement(
							__(
								"Private sites aren't accessible to the world. Read more about them <a>here</a>."
							),
							{
								a: (
									<a
										href={ localizeUrl(
											'https://wordpress.com/support/settings/privacy-settings/'
										) }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							}
						) }
					</SecondaryText>
				}
				illustration=""
			/>
		);
	}

	if ( status === 'coming-soon' ) {
		return (
			<NoSitesLayout
				title={ <Title> { __( 'You have no coming soon sites' ) } </Title> }
				line={
					<SecondaryText>
						{ createInterpolateElement(
							__(
								'Coming soon sites will display a landing page letting people know that a site is being built. Read more about them <a>here</a>.'
							),
							{
								a: (
									<a
										href={ localizeUrl(
											'https://wordpress.com/support/settings/privacy-settings/'
										) }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							}
						) }
					</SecondaryText>
				}
				illustration=""
			/>
		);
	}

	if ( status === 'redirect' ) {
		return (
			<NoSitesLayout
				title={ <Title> { __( 'You have no redirected sites' ) } </Title> }
				line={
					<SecondaryText>
						{ createInterpolateElement(
							__(
								'Redirected sites send a visitor directly to the mapped domain. Read more about them <a>here</a>.'
							),
							{
								a: (
									<a
										href={ localizeUrl( 'https://wordpress.com/support/site-redirect/' ) }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							}
						) }
					</SecondaryText>
				}
				illustration=""
			/>
		);
	}

	if ( isEnabled( 'hosting-onboarding-i2' ) ) {
		return (
			<NoSitesLayout
				title={ <Title css={ { marginBlockEnd: 0 } }> { __( 'Add a site to start' ) } </Title> }
				line={
					<SecondaryText>
						{ __( 'Create a brand new site or import an existing one' ) }
					</SecondaryText>
				}
				illustration=""
			>
				<div css={ { display: 'flex', gap: 16 } }>
					<SetupLink href="/setup/new-hosted-site">
						<CreateSiteIcon />
						{ __( 'Create a site' ) }
					</SetupLink>
					<SetupLink href="/setup/import-focused">
						<ImportSiteIcon />
						{ __( 'Import a site' ) }
					</SetupLink>
				</div>
			</NoSitesLayout>
		);
	}

	return (
		<NoSitesLayout
			title={ <Title> { __( 'Create your first site' ) } </Title> }
			line={
				<SecondaryText>
					{ __(
						"It's time to get your ideas online. We'll guide you through the process of creating a site that best suits your needs."
					) }
				</SecondaryText>
			}
			action={ __( 'Create your first site' ) }
			actionURL="/start?source=sites-dashboard&ref=calypso-nosites"
			illustration="/calypso/images/illustrations/illustration-empty-sites.svg"
			illustrationWidth={ 124 }
			illustrationHeight={ 101 }
		/>
	);
};
