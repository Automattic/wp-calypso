import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';

const Subheader = styled.p`
	margin: -32px 0 40px 0;
	color: var( --studio-gray-60 );
	font-size: 1rem;
	text-align: center;
	button.is-borderless {
		font-weight: 500;
		color: var( --studio-gray-90 );
		text-decoration: underline;
		font-size: 16px;
		padding: 0;
	}
	@media ( max-width: 960px ) {
		margin-top: -16px;
	}
`;

const SecondaryFormattedHeader = ( { siteSlug }: { siteSlug?: string | null } ) => {
	const translate = useTranslate();
	const headerText = translate( 'Upgrade your plan to access this feature and more' );
	const subHeaderText = (
		<Button className="plans-features-main__view-all-plans is-link" href={ `/plans/${ siteSlug }` }>
			{ translate( 'View all plans' ) }
		</Button>
	);

	return (
		<FormattedHeader
			headerText={ headerText }
			subHeaderText={ subHeaderText }
			compactOnMobile
			isSecondary
		/>
	);
};

const PlansPageSubheader = ( {
	siteSlug,
	isDisplayingPlansNeededForFeature,
	deemphasizeFreePlan,
	onClickFreePlanCTA,
	content,
}: {
	siteSlug?: string | null;
	isDisplayingPlansNeededForFeature: boolean;
	deemphasizeFreePlan?: boolean;
	onClickFreePlanCTA: () => void;
	content?: ReactNode;
} ) => {
	const translate = useTranslate();

	return (
		<>
			{ deemphasizeFreePlan && (
				<Subheader>
					{ translate(
						`Unlock a powerful bundle of features. Or {{link}}start with a free plan{{/link}}.`,
						{
							components: {
								link: <Button onClick={ onClickFreePlanCTA } borderless />,
							},
						}
					) }
				</Subheader>
			) }
			{ ! deemphasizeFreePlan && content && <Subheader>{ content }</Subheader> }
			{ isDisplayingPlansNeededForFeature && <SecondaryFormattedHeader siteSlug={ siteSlug } /> }
		</>
	);
};

export default PlansPageSubheader;
