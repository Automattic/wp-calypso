import { NextButton } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import AsyncLoad from 'calypso/components/async-load';
import FormattedHeader from 'calypso/components/formatted-header';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { DIFMFAQ } from './faq';
import { DIFMServiceDescription } from './service-description';
import { useDIFMHeading } from './use-difm-heading';

import './difm-landing.scss';

const Wrapper = styled.div`
	display: flex;
	align-items: flex-start;
	padding: 32px;
	max-width: 1040px;
	margin: 0 auto;

	.difmStartingPoint & {
		padding: 12px;
	}
`;

const ContentSection = styled.div`
	flex: 1;
	padding-right: 10px;
	width: 50%;
`;

const ImageSection = styled.div`
	min-width: 540px;
	width: 50%;
	height: 562px;
	display: flex;
	align-items: center;
	justify-content: center;
	@media ( max-width: 960px ) {
		display: none;
	}
`;

const Header = styled( FormattedHeader )`
	margin: 0 0 24px 0 !important;
	.formatted-header__title {
		font-size: 2.75rem !important;
		margin-bottom: 16px !important;
		line-height: 3rem;
	}
	.formatted-header__subtitle {
		font-size: 1rem;
	}
`;

const CTASectionWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-start;
	gap: 16px;
	margin: 2rem 0;
	.components-button.is-primary {
		border-radius: 4px;
		font-size: 0.875rem;
		font-weight: 500;
		justify-content: center;
		&:focus {
			border: none;
			box-shadow: none;
			outline: solid 2px var( --color-accent-60 );
			outline-offset: 2px;
		}
	}
	.components-button.is-secondary {
		border-radius: 4px;
		box-shadow: inset 0 0 0 1px
			var( --studio-wordpress-blue-50, var( --wp-admin-theme-color, #3858e9 ) );
		outline: 1px solid transparent;
		white-space: nowrap;
		color: var( --studio-wordpress-blue-50, var( --wp-admin-theme-color, #3858e9 ) );
		background: transparent;
		border: none;
		&:focus {
			border: none;
			box-shadow: none;
			outline: solid 2px var( --color-accent-60 );
			outline-offset: 2px;
		}
	}
`;

export default function DIFMLanding( {
	showNewOrExistingSiteChoice,
	onPrimarySubmit,
	onSecondarySubmit,
	siteId,
	isStoreFlow,
}: {
	onPrimarySubmit: () => void;
	onSecondarySubmit?: () => void;
	showNewOrExistingSiteChoice: boolean;
	siteId?: number | null;
	isStoreFlow: boolean;
} ) {
	const translate = useTranslate();

	const { headerText, subHeaderText } = useDIFMHeading( {
		isStoreFlow,
		siteId: siteId ?? undefined,
	} );

	const ctas = showNewOrExistingSiteChoice ? (
		<>
			<NextButton onClick={ onPrimarySubmit }>{ translate( 'Start a new site' ) }</NextButton>
			<NextButton onClick={ onSecondarySubmit } variant="secondary">
				{ translate( 'Use an existing site' ) }
			</NextButton>
		</>
	) : (
		<NextButton onClick={ onPrimarySubmit }>{ translate( 'Get started' ) }</NextButton>
	);

	return (
		<>
			<Wrapper>
				<ContentSection>
					<Header
						brandFont
						align="left"
						headerText={ headerText }
						subHeaderText={ subHeaderText }
					/>
					<DIFMServiceDescription isStoreFlow={ isStoreFlow } />
					<CTASectionWrapper>{ ctas }</CTASectionWrapper>
				</ContentSection>
				<ImageSection>
					<AsyncLoad
						require="./site-build-showcase"
						placeholder={ <LoadingEllipsis /> }
						isStoreFlow={ isStoreFlow }
					/>
				</ImageSection>
			</Wrapper>
			<DIFMFAQ
				isStoreFlow={ isStoreFlow }
				siteId={ siteId ?? undefined }
				ctaSection={ <CTASectionWrapper>{ ctas }</CTASectionWrapper> }
			/>
		</>
	);
}
