import { PLAN_100_YEARS, getPlan } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { HUNDRED_YEAR_DOMAIN_FLOW } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { Button, Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { SMALL_BREAKPOINT } from './constants';
import HundredYearPlanLogo from './hundred-year-plan-logo';

const StyledModal = styled( Modal )`
	&.is-full-screen {
		background: #040b13;
		max-width: 1192px;
		.components-button.has-icon {
			color: var( --studio-gray-0 );
		}
		.components-modal__header {
			border: none;
		}
	}
`;

const Wrapper = styled.div`
	display: flex;
	flex-wrap: wrap;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 32px;
	padding: 0;
	@media ( min-width: ${ SMALL_BREAKPOINT }px ) {
		gap: 60px;
		padding: 0 90px;
	}
`;

const Title = styled.div`
	color: var( --studio-gray-5 );
	text-align: center;

	/* Xl/Serif Big */
	font-family: 'Recoleta', serif;
	font-size: 44px;
	font-style: normal;
	font-weight: 400;
	line-height: 52px; /* 118.182% */
	letter-spacing: 0.2px;
`;

const Description = styled.div`
	color: var( --studio-gray-5 );
	text-align: center;

	/* Base/Medium */
	font-family: 'SF Pro Text', sans-serif;
	font-size: 14px;
	font-style: normal;
	font-weight: 500;
	line-height: 20px; /* 142.857% */
	letter-spacing: -0.15px;
`;

const Header = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 12px;

	.hundred-year-plan-logo {
		margin-bottom: 24px;
	}
`;

const AnnouncementLink = styled( Button )`
	&.is-link {
		color: var( --studio-gray-5 );
		text-align: right;
		font-family: 'SF Pro Text', sans-serif;
		font-size: 14px;
		font-style: normal;
		font-weight: 500;
		line-height: 20px; /* 142.857% */
		letter-spacing: -0.16px;
		text-decoration-line: underline;

		margin-top: 20px;

		.gridicon {
			margin-inline-start: 4px;
		}

		&:hover {
			color: var( --studio-gray-0 );
			text-decoration: underline;
		}
	}
`;

const Row = styled.div`
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: space-between;
	gap: 60px;
`;

const RowItem = styled.div`
	width: 100%;
	@media ( min-width: 600px ) {
		flex: 40%;
	}
`;

const RowTitle = styled.div`
	color: #7f9af3;
	font-feature-settings:
		'clig' off,
		'liga' off;
	font-family: 'SF Pro Display', sans-serif;
	font-size: 16px;
	font-style: normal;
	font-weight: 500;
	line-height: 26px; /* 144.444% */
	text-transform: uppercase;

	@media ( min-width: ${ SMALL_BREAKPOINT }px ) {
		font-size: 18px;
	}
`;

const RowContent = styled.div`
	color: var( --studio-gray-0 );
	font-feature-settings:
		'clig' off,
		'liga' off;

	/* Lg/Regular */
	font-family: 'SF Pro Display', sans-serif;
	font-size: 12px;
	font-style: normal;
	font-weight: 400;
	line-height: 26px; /* 144.444% */
	@media ( min-width: ${ SMALL_BREAKPOINT }px ) {
		font-size: 18px;
	}
`;

export default function InfoModal( {
	onClose,
	flowName,
}: {
	onClose: () => void;
	flowName: string;
} ) {
	const translate = useTranslate();
	const planTitle =
		flowName === HUNDRED_YEAR_DOMAIN_FLOW
			? translate( '100-Year Domain' )
			: getPlan( PLAN_100_YEARS )?.getTitle();

	return (
		<StyledModal title="" onRequestClose={ onClose } isFullScreen>
			<Wrapper>
				<Header>
					<HundredYearPlanLogo />
					<Title>{ planTitle }</Title>
					<Description>
						{ translate(
							'Your stories, achievements, and memories preserved for generations to come.'
						) }
						<br />
						{ translate( 'One payment. One hundred years of legacy.' ) }
					</Description>
					<AnnouncementLink
						variant="link"
						href={ localizeUrl(
							'https://wordpress.com/blog/2023/08/25/introducing-the-100-year-plan/'
						) }
						target="_blank"
					>
						<>
							{ translate( 'Read the announcement post' ) }
							<Gridicon icon="external" size={ 16 } />
						</>
					</AnnouncementLink>
				</Header>
				<Row>
					<RowItem>
						<RowTitle>{ translate( 'Century-Long Domain Registration' ) }</RowTitle>
						<RowContent>
							{ translate(
								'A domain is your most valuable digital asset. While standard domain registrations last a decade, our 100-Year Plan gives you an opportunity to secure your domain for a full century.'
							) }
						</RowContent>
					</RowItem>
					<RowItem>
						<RowTitle>{ translate( 'Peace Of Mind' ) }</RowTitle>
						<RowContent>
							{ translate(
								'As guardians of your life’s work, we take our duty seriously. At the platform level, we maintain multiple backups of your content across geographically distributed data centers, automatically submit your site to the Internet Archive if it’s public, and will provide an optional locked mode.'
							) }
						</RowContent>
					</RowItem>
					<RowItem>
						<RowTitle>{ translate( 'Enhanced Ownership Protocols' ) }</RowTitle>
						<RowContent>
							{ translate(
								'Navigate life’s milestones with ease. Whether you’re gifting a site to a newborn or facilitating a smooth transfer of ownership, we’re here to assist every step of the way.'
							) }
						</RowContent>
					</RowItem>
					<RowItem>
						<RowTitle>{ translate( 'Top-Tier Managed WordPress Hosting' ) }</RowTitle>
						<RowContent>
							{ translate(
								'The very best managed WordPress experience with unmetered bandwidth, best-in-class speed, and unstoppable security bundled in one convenient package.'
							) }
						</RowContent>
					</RowItem>
				</Row>
			</Wrapper>
		</StyledModal>
	);
}
