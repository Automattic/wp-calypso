import { ClassNames } from '@emotion/react';
import styled from '@emotion/styled';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import EmptyContent from 'calypso/components/empty-content';
import { SiteData } from 'calypso/state/ui/selectors/site-data';
import { SitesTable } from './sites-table';

const EmptyContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	height: 600px;

	.empty-content__line {
		max-width: 650px;
	}
`;

type SitesContainerProps = {
	sites: SiteData[];
	filter: string;
};

export const SitesContainer = ( { sites, filter }: SitesContainerProps ) => {
	const { __ } = useI18n();
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

	switch ( filter ) {
		case 'launched':
			return (
				<EmptyContainer>
					<EmptyContent
						title={ __( "You haven't launched a site" ) }
						line={
							<p>
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
							</p>
						}
						illustration={ '' }
					/>
				</EmptyContainer>
			);
		case 'private':
			return (
				<EmptyContainer>
					<EmptyContent
						title={ __( 'You have no private sites' ) }
						line={
							<p>
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
							</p>
						}
						illustration={ '' }
					/>
				</EmptyContainer>
			);
		case 'coming-soon':
			return (
				<EmptyContainer>
					<EmptyContent
						title={ __( 'You have no coming soon sites' ) }
						line={
							<p>
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
							</p>
						}
						illustration={ '' }
					/>
				</EmptyContainer>
			);
		default:
			return (
				<EmptyContainer>
					<EmptyContent
						title={ __( 'Create your first site' ) }
						line={ __(
							"It's time to get your ideas online. We'll guide you through the process of creating a site that best suits your needs."
						) }
						action={ __( 'Create your first site' ) }
						actionURL={ '/start?ref=sites-dashboard' }
						illustration={ '/calypso/images/illustrations/illustration-nosites.svg' }
					/>
				</EmptyContainer>
			);
	}
};
