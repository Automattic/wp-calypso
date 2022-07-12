import { ClassNames } from '@emotion/react';
import styled from '@emotion/styled';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import EmptyContent from 'calypso/components/empty-content';
import { SiteData } from 'calypso/state/ui/selectors/site-data';
import { SitesTable } from './sites-table';

const EmptySites = styled( EmptyContent )`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;

const SecondaryText = styled.p`
	max-width: 650px;
`;

const Title = styled.div`
	margin-top: 50%;
`;
type SitesContainerProps = {
	sites: SiteData[];
	status: string;
};

export const SitesContainer = ( { sites, status }: SitesContainerProps ) => {
	const { __ } = useI18n();
	sites = [];
	if ( sites.length > 0 ) {
		return (
			<ClassNames>
				{ ( { css } ) => (
					<SitesTable
						className={ css`
							margin-top: 32px;
						` }
						sites={ sites }
					/>
				) }
			</ClassNames>
		);
	}

	if ( status === 'launched' ) {
		return (
			<EmptySites
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
										href={ 'https://wordpress.com/support/' }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							}
						) }
					</SecondaryText>
				}
				illustration={ '' }
			/>
		);
	}

	if ( status === 'private' ) {
		return (
			<EmptySites
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
										href={ 'https://wordpress.com/support/settings/privacy-settings/' }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							}
						) }
					</SecondaryText>
				}
				illustration={ '' }
			/>
		);
	}

	if ( status === 'coming-soon' ) {
		return (
			<EmptySites
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
										href={ 'https://wordpress.com/support/settings/privacy-settings/' }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							}
						) }
					</SecondaryText>
				}
				illustration={ '' }
			/>
		);
	}

	return (
		<EmptySites
			title={ __( 'Create your first site' ) }
			line={ __(
				"It's time to get your ideas online. We'll guide you through the process of creating a site that best suits your needs."
			) }
			action={ __( 'Create your first site' ) }
			actionURL={ '/start?ref=sites-dashboard' }
			illustration={ '/calypso/images/illustrations/illustration-nosites.svg' }
		/>
	);
};
