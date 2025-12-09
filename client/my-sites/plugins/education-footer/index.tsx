import { isEnabled } from '@automattic/calypso-config';
import { useOpenArticleInHelpCenter } from '@automattic/help-center/src/hooks';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { Icon, shield, plugins, currencyDollar } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import FeatureItem from 'calypso/components/feature-item';
import LinkCard from 'calypso/components/link-card';
import Section, { SectionContainer } from 'calypso/components/section';
import { addQueryArgs } from 'calypso/lib/route';
import PluginsResultsHeader from 'calypso/my-sites/plugins/plugins-results-header';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { isUserLoggedIn, getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { getSectionName } from 'calypso/state/ui/selectors';

const ThreeColumnContainer = styled.div`
	@media ( max-width: 660px ) {
		padding: 0 16px;
	}

	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;

	.full-width-section & {
		flex-wrap: nowrap;
		overflow: auto;
		scrollbar-width: none;
		gap: 28px;

		&.plugin-how-to-guides {
			margin-top: 52px;
		}

		.card-block:focus {
			outline: none;
		}

		&::-webkit-scrollbar {
			display: none;
		}

		.feature-item-container {
			min-width: 310px;
		}

		@media ( max-width: 660px ) {
			scroll-padding: 0 32px;
			margin: 0 -16px;

			&.plugin-how-to-guides {
				flex-direction: column;
				margin-top: 12px;
			}
		}
	}
`;

const EducationFooterContainer = styled.div`
	margin-top: 32px;

	> div:first-child {
		padding: 0;
		margin-bottom: 18px;

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

			.full-width-section & {
				padding: 0;
			}
		}
	}
`;

const MarketplaceContainer = styled.div< { isloggedIn: boolean } >`
	--color-accent: var( --studio-blue-50 );
	--color-accent-60: var( --studio-blue-60 );
	margin-bottom: -32px;

	.full-width-section & {
		--color-accent: var( --studio-gray-100 );
		--color-accent-60: var( --studio-gray-90 );

		.marketplace-cta {
			font-weight: 500;
		}
		${ SectionContainer }::before {
			display: none;
		}
	}

	.marketplace-cta {
		min-width: 122px;
		margin-top: 16px;

		@media ( max-width: 660px ) {
			margin-left: 16px;
			margin-right: 16px;
		}
	}

	${ ( { isloggedIn } ) =>
		! isloggedIn &&
		`${ SectionContainer } {
		padding-bottom: 32px;
	}` }

	${ SectionContainer }::before {
		background-color: #f6f7f7;
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

const CardTitle = styled( CardText )`
	font-size: 14px;

	.full-width-section & {
		font-size: 18px;
	}
`;
const FeatureIcon = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	border-radius: 50%;
	background-color: var( --studio-blue-50 );
	margin-bottom: 16px;

	svg {
		fill: var( --color-text-inverted );
	}
`;

interface FeatureHeaderProps {
	icon: React.ReactNode;
	title: string;
}

const FeatureHeader = ( { icon, title }: FeatureHeaderProps ) => {
	if ( ! isEnabled( 'marketplace-redesign' ) ) {
		return title;
	}

	return (
		<>
			<FeatureIcon>{ icon }</FeatureIcon>
			{ title }
		</>
	);
};

export const MarketplaceFooter = () => {
	const { __ } = useI18n();
	const translate = useTranslate();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const currentUserSiteCount = useSelector( getCurrentUserSiteCount );
	const sectionName = useSelector( getSectionName );
	const showCta = ! isLoggedIn || currentUserSiteCount === 0;

	const startUrl = addQueryArgs(
		{
			ref: sectionName + '-lp',
		},
		sectionName === 'plugins' ? '/start/business' : '/start'
	);

	const headerTitle = isEnabled( 'marketplace-redesign' )
		? translate( "You pick the plugin,{{br}}{{/br}}we'll take care of the rest", {
				components: { br: <br /> },
		  } )
		: __( "You pick the plugin. We'll take care of the rest." );

	const ctaButton = showCta ? (
		<Button
			variant={ isEnabled( 'marketplace-redesign' ) ? 'secondary' : 'primary' }
			className="marketplace-cta"
			href={ startUrl }
		>
			{ __( 'Get started' ) }
		</Button>
	) : undefined;

	return (
		<MarketplaceContainer isloggedIn={ isLoggedIn }>
			<Section header={ headerTitle as React.ReactElement } subheader={ ctaButton }>
				<ThreeColumnContainer>
					<FeatureItem
						header={
							<FeatureHeader
								icon={ <Icon icon={ shield } size={ 24 } /> }
								title={ __( 'Fully managed' ) }
							/>
						}
					>
						{ isEnabled( 'marketplace-redesign' )
							? __(
									'Plugins authored by WordPress.com are fully managed by our team. No security patches. No update nags. It just works.'
							  )
							: __(
									'Premium plugins are fully managed by the team at WordPress.com. No security patches. No update nags. It just works.'
							  ) }
					</FeatureItem>
					<FeatureItem
						header={
							<FeatureHeader
								icon={ <Icon icon={ plugins } size={ 24 } /> }
								title={ __( 'Thousands of plugins' ) }
							/>
						}
					>
						{ __(
							'From WordPress.com premium plugins to thousands more community-authored plugins, we’ve got you covered.'
						) }
					</FeatureItem>
					<FeatureItem
						header={
							<FeatureHeader
								icon={ <Icon icon={ currencyDollar } size={ 24 } /> }
								title={ __( 'Flexible pricing' ) }
							/>
						}
					>
						{ isEnabled( 'marketplace-redesign' )
							? __(
									'Pay yearly and save. Or keep it flexible with monthly plugin pricing. It’s entirely up to you.'
							  )
							: __(
									'Pay yearly and save. Or keep it flexible with monthly premium plugin pricing. It’s entirely up to you.'
							  ) }
					</FeatureItem>
				</ThreeColumnContainer>
			</Section>
		</MarketplaceContainer>
	);
};

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

	const isMarketplaceRedesignEnabled = isEnabled( 'marketplace-redesign' );

	const links = {
		websiteBuilding: localizeUrl( 'https://wordpress.com/support/plugins/' ),
		customization: localizeUrl( 'https://wordpress.com/support/plugins/install-a-plugin/' ),
		seo: localizeUrl( 'https://wordpress.com/support/plugins/find-and-choose-plugins/' ),
	};

	const border = ! isMarketplaceRedesignEnabled ? 'var(--studio-gray-5)' : undefined;

	return (
		<EducationFooterContainer>
			<PluginsResultsHeader
				title={ __( 'Get started with plugins' ) }
				subtitle={
					isMarketplaceRedesignEnabled
						? __( 'Become a plugin pro with our step-by-step guides.' )
						: __( 'Our favorite how-to guides to get you started with plugins.' )
				}
			/>
			<ThreeColumnContainer className="plugin-how-to-guides">
				<LinkCard
					image={
						isMarketplaceRedesignEnabled
							? '/calypso/images/plugins/what-are-plugins.png'
							: undefined
					}
					title={
						<CardTitle color="var(--studio-gray-100)">
							{ __( 'What Are WordPress Plugins? Everything You Need to Know as a Beginner' ) }
						</CardTitle>
					}
					titleMarginBottom="16px"
					cta={ <ReadMoreLink /> }
					url={ links.websiteBuilding }
					border={ border }
					onClick={ onClickLinkCard( 'website_building', links.websiteBuilding ) }
				/>
				<LinkCard
					image={
						isMarketplaceRedesignEnabled
							? '/calypso/images/plugins/how-to-find-plugins.png'
							: undefined
					}
					title={
						<CardTitle color="var(--studio-gray-100)">
							{ __( 'How to Find and Choose the Best WordPress Plugins (Useful for All Sites)' ) }
						</CardTitle>
					}
					titleMarginBottom="16px"
					cta={ <ReadMoreLink /> }
					url={ links.seo }
					border={ border }
					onClick={ onClickLinkCard( 'seo', links.seo ) }
				/>
				<LinkCard
					image={
						isMarketplaceRedesignEnabled
							? '/calypso/images/plugins/how-to-install-plugins.png'
							: undefined
					}
					title={
						<CardTitle color="var(--studio-gray-100)">
							{ __(
								"How to Install Plugins on Your WordPress.com site: The Complete Beginner's Guide"
							) }
						</CardTitle>
					}
					titleMarginBottom="16px"
					cta={ <ReadMoreLink /> }
					url={ links.customization }
					border={ border }
					onClick={ onClickLinkCard( 'customization', links.customization ) }
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
