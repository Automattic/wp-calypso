import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { CALYPSO_CONTACT, SUPPORT_ROOT } from 'calypso/lib/url/support';
import type {
	ThankYouNextStepProps,
	ThankYouProps,
	ThankYouSectionProps,
	ThankYouSupportSectionProps,
	ThankYouNoticeProps,
} from 'calypso/components/thank-you/types';

import './style.scss';

const ThankYouContainer = styled.div`
	background-color: #fff;
	-ms-overflow-style: none;
	/* Negative value to counteract default content padding */
	margin-top: calc( -79px + var( --masterbar-height ) );
`;

const ThankYouSectionTitle = styled.h1`
	font-size: 1.5em;
	margin-bottom: 8px;
`;

const ThankYouSectionContainer = styled.div`
	margin-bottom: 35px;
`;

const ThankYouBody = styled.div`
	width: 100%;
	display: flex;
	justify-content: center;
	margin-top: 50px;
	> div {
		width: 600px;
		padding: 0 20px;
	}
	div {
		min-width: 144px;
	}
`;

const ThankYouNextSteps = styled.div`
	h3 {
		font-weight: 600;
	}

	p {
		color: var( --studio-gray-50 );
		padding-right: 20px;
	}
	> div {
		display: flex;
	}
`;

const ThankYouNoticeContainer = styled.div`
	height: 32px;
	padding: 8px;
	font-size: 14px;
	background: var( --studio-gray-70 );
	color: var( --studio-white );
	display: flex;
	align-items: center;
	justify-content: center;

	.thank-you__notice-icon {
		padding-right: 8px;
	}
`;

const ThankYouNotice = ( props: ThankYouNoticeProps ) => {
	const { noticeTitle, noticeIcon } = props;

	return (
		<ThankYouNoticeContainer className="thank-you__notice">
			{ noticeIcon && (
				<Gridicon icon={ noticeIcon } className="thank-you__notice-icon" size={ 24 } />
			) }
			{ noticeTitle }
		</ThankYouNoticeContainer>
	);
};

const ThankYouNextStep = ( props: ThankYouNextStepProps ) => {
	const { stepCta, stepDescription, stepKey, stepTitle } = props;

	return (
		<div className="thank-you__step" key={ stepKey }>
			<div>
				<h3>{ stepTitle }</h3>
				<p>{ stepDescription }</p>
			</div>
			<div className="thank-you__step-cta">{ stepCta }</div>
		</div>
	);
};

const ThankYouSection = ( props: ThankYouSectionProps ) => {
	const { nextSteps, sectionTitle } = props;

	const nextStepComponents = nextSteps.map( ( nextStepProps, index ) => (
		<ThankYouNextStep key={ index } { ...nextStepProps } />
	) );

	return (
		<ThankYouSectionContainer>
			<ThankYouSectionTitle className="thank-you__body-header wp-brand-font">
				{ sectionTitle }
			</ThankYouSectionTitle>

			<ThankYouNextSteps>{ nextStepComponents }</ThankYouNextSteps>
		</ThankYouSectionContainer>
	);
};

const ThankYouSupportSection = ( props: ThankYouSupportSectionProps ) => {
	const { links, title, description } = props;

	const supportLinks = links.map( ( { href, title }, index ) => (
		<a
			key={ index }
			href={ href }
			className="thank-you__help-link"
			target="_blank"
			rel="noreferrer noopener"
		>
			{ title }
			<Gridicon className="thank-you__icon-external" icon="external" />
		</a>
	) );

	return (
		<ThankYouSectionContainer>
			<ThankYouSectionTitle className="thank-you__body-header wp-brand-font">
				{ title }
			</ThankYouSectionTitle>
			<p className="thank-you__help-text">{ description }</p>
			<>{ supportLinks }</>
		</ThankYouSectionContainer>
	);
};

export const ThankYou = ( props: ThankYouProps ): JSX.Element => {
	const translate = useTranslate();

	const {
		headerBackgroundColor = 'var( --studio-blue-50 )',
		headerClassName,
		headerTextColor = 'var( --studio-white )',
		containerClassName,
		sections,
		showSupportSection = true,
		thankYouTitle,
		thankYouSubtitle,
		thankYouImage,
		thankYouNotice,
	} = props;

	const ThankYouTitleContainer = styled.div`
		h1 {
			font-size: 2em;
		}
		h2 {
			margin-bottom: 16px;
		}
		color: ${ headerTextColor };
	`;

	const ThankYouHeader = styled.div`
		width: 100%;
		display: flex;
		justify-content: center;
		background-color: ${ headerBackgroundColor };
		min-height: 352px;
		img {
			width: auto;
			height: 200px;
			margin-bottom: 14px;
		}
	`;
	const defaultSupportSectionProps = {
		title: translate( 'How can we help?' ),
		description: translate(
			'Our Happiness Engineers are here if you need help, or if you have any questions.'
		),
		links: [
			{
				href: CALYPSO_CONTACT,
				title: translate( 'Ask a question' ),
			},
			{
				href: SUPPORT_ROOT,
				title: translate( 'View support documentation' ),
			},
		],
	};

	const thankYouSections = sections.map( ( sectionProps, index ) => (
		<ThankYouSection key={ index } { ...sectionProps } />
	) );

	return (
		<ThankYouContainer className={ classNames( 'thank-you__container', containerClassName ) }>
			<ThankYouHeader className={ classNames( 'thank-you__container-header', headerClassName ) }>
				{ /* eslint-disable-next-line jsx-a11y/alt-text */ }
				<img { ...thankYouImage } />
				{ thankYouTitle && (
					<ThankYouTitleContainer>
						<h1 className="thank-you__header-title wp-brand-font">{ thankYouTitle }</h1>
						{ thankYouSubtitle && (
							<h2 className="thank-you__header-subtitle">{ thankYouSubtitle }</h2>
						) }
					</ThankYouTitleContainer>
				) }
			</ThankYouHeader>
			{ thankYouNotice && <ThankYouNotice { ...thankYouNotice } /> }
			<ThankYouBody className="thank-you__body">
				<div>
					{ thankYouSections }

					{ showSupportSection && <ThankYouSupportSection { ...defaultSupportSectionProps } /> }
				</div>
			</ThankYouBody>
		</ThankYouContainer>
	);
};
