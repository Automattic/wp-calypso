import { isEnabled } from '@automattic/calypso-config';
import { localizeUrl } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import EmptyContent from 'calypso/components/empty-content';
import { addQueryArgs } from 'calypso/lib/url';
import { CreateSiteIcon, ImportSiteIcon } from './no-sites-message-icons';
import { SparklingCTA } from './sparkling-cta';

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

	const newSiteURL = isEnabled( 'hosting-onboarding-i2' ) ? '/setup/new-hosted-site' : '/start';

	return (
		<NoSitesLayout
			title={ <Title css={ { marginBlockEnd: 0 } }> { __( 'Add a site to start' ) } </Title> }
			line={
				<SecondaryText>{ __( 'Create a brand new site or import an existing one' ) }</SecondaryText>
			}
			illustration=""
		>
			<div css={ { display: 'flex', gap: 16 } }>
				<SparklingCTA
					target={ addQueryArgs(
						{ source: 'sites-dashboard', ref: 'calypso-nosites' },
						newSiteURL
					) }
					icon={ <CreateSiteIcon /> }
					label={ __( 'Create a site' ) }
				/>
				<SparklingCTA
					target="/setup/import-focused"
					icon={ <ImportSiteIcon /> }
					label={ __( 'Import a site' ) }
				/>
			</div>
		</NoSitesLayout>
	);
};
