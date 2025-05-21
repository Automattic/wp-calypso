import { useOpenArticleInHelpCenter } from '@automattic/help-center/src/hooks';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback } from 'react';
import LinkCard from 'calypso/components/link-card';
import PluginsResultsHeader from 'calypso/my-sites/plugins/plugins-results-header';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

const ThreeColumnContainer = styled.div`
	@media ( max-width: 660px ) {
		padding: 0 16px;
	}

	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
`;

const EducationFooterContainer = styled.div`
	margin-top: 32px;

	> div:first-child {
		padding: 0;
		margin-bottom: 18px;

		@media ( max-width: 660px ) {
			padding: 0 16px;
		}

		.wp-brand-font {
			font-size: var( --scss-font-title-medium );
		}
	}

	.plugin-how-to-guides {
		@media ( min-width: 1280px ) {
			justify-content: flex-start;
			gap: 18px;
		}
	}

	.card-block {
		display: flex;
		width: calc( 33% - 10px );

		@media ( max-width: 960px ) {
			width: 100%;
			margin-top: 10px;

			> div:first-child {
				padding: 16px;
			}
		}

		> div:first-child:hover {
			border-color: var( --studio-gray-30 );
		}

		div {
			width: 100%;
			text-wrap: pretty;
		}
	}
`;

const CardText = styled.span< { color: string } >`
	color: ${ ( { color } ) => color };
	font-family: 'SF Pro Text', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
		'Oxygen-Sans', 'Ubuntu', 'Cantarell', 'Helvetica Neue', sans-serif;
	font-weight: 400;
	font-size: 14px;
	line-height: 20px;
`;

const EducationFooter = () => {
	const { __ } = useI18n();
	const localizeUrl = useLocalizeUrl();
	const dispatch = useDispatch();
	const { openArticleInHelpCenter } = useOpenArticleInHelpCenter();
	const isLoggedIn = useSelector( isUserLoggedIn );

	const onClickLinkCard = useCallback(
		( content_type: string, url: string ) => ( e: React.MouseEvent< HTMLAnchorElement > ) => {
			dispatch(
				recordTracksEvent( 'calypso_plugins_educational_content_click', { content_type } )
			);
			if ( isLoggedIn ) {
				e.preventDefault();
				openArticleInHelpCenter( url );
			}
		},
		[ dispatch, openArticleInHelpCenter, isLoggedIn ]
	);

	const links = {
		websiteBuilding: localizeUrl( 'https://wordpress.com/support/plugins/' ),
		customization: localizeUrl( 'https://wordpress.com/support/plugins/install-a-plugin/' ),
		seo: localizeUrl( 'https://wordpress.com/support/plugins/find-and-choose-plugins/' ),
	};

	return (
		<EducationFooterContainer>
			<PluginsResultsHeader
				title={ __( 'Get started with plugins' ) }
				subtitle={ __( 'Our favorite how-to guides to get you started with plugins.' ) }
			/>
			<ThreeColumnContainer className="plugin-how-to-guides">
				<LinkCard
					title={
						<CardText color="var(--studio-gray-100)">
							{ __( 'What Are WordPress Plugins? Everything You Need to Know as a Beginner' ) }
						</CardText>
					}
					titleMarginBottom="16px"
					cta={ <ReadMoreLink /> }
					url={ links.websiteBuilding }
					border="var(--studio-gray-5)"
					onClick={ onClickLinkCard( 'website_building', links.websiteBuilding ) }
				/>
				<LinkCard
					title={
						<CardText color="var(--studio-gray-100)">
							{ __(
								"How to Install Plugins on Your WordPress.com site: The Complete Beginner's Guide"
							) }
						</CardText>
					}
					titleMarginBottom="16px"
					cta={ <ReadMoreLink /> }
					url={ links.customization }
					border="var(--studio-gray-5)"
					onClick={ onClickLinkCard( 'customization', links.customization ) }
				/>
				<LinkCard
					title={
						<CardText color="var(--studio-gray-100)">
							{ __( 'How to Find and Choose the Best WordPress Plugins (Useful for All Sites)' ) }
						</CardText>
					}
					titleMarginBottom="16px"
					cta={ <ReadMoreLink /> }
					url={ links.seo }
					border="var(--studio-gray-5)"
					onClick={ onClickLinkCard( 'seo', links.seo ) }
				/>
			</ThreeColumnContainer>
		</EducationFooterContainer>
	);
};

function ReadMoreLink() {
	const { __ } = useI18n();

	return <CardText color="var(--studio-blue-50)">{ __( 'Learn more' ) }</CardText>;
}

export default EducationFooter;
