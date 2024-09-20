import { Dialog } from '@automattic/components';
import Search from '@automattic/search';
import { Global, css } from '@emotion/react';
import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import AIassistantIllustration from 'calypso/assets/images/domains/ai-assitant.svg';
import headerImage from 'calypso/assets/images/illustrations/business-tools.png';

const HeaderImage = styled.img`
	margin: 32px auto;
	display: block;
`;

export const DialogContainer = styled.div`
	padding: 0;
`;

export const Heading = styled.div< { shrinkMobileFont?: boolean } >`
	font-family: Recoleta;
	color: var( --studio-gray-100 );
	font-size: ${ ( { shrinkMobileFont } ) => ( shrinkMobileFont ? '22px' : '32px' ) };
	text-align: center;
	@media ( min-width: 780px ) {
		font-size: 32px;
		line-height: 40px;
	}
`;

export const SubHeading = styled.div`
	margin-top: 8px;
	font-family: 'SF Pro Text', sans-serif;
	color: var( --studio-gray-60 );
	font-size: 14px;
	line-height: 20px;
	text-align: center;
	@media ( min-width: 780px ) {
		font-size: 16px;
		line-height: 24px;
	}
`;

export const ButtonContainer = styled.div`
	display: flex;
	flex-direction: column;
	margin: 48px 0 0;
	box-shadow: 0 0 70px rgba( 0, 0, 0, 0.1 );

	.search-component {
		border: 1px solid #a7aaad;
		border-radius: 4px;
		overflow: hidden;
	}
`;

export const Row = styled.div`
	display: flex;
	justify-content: space-between;
	padding: 24px;
	gap: 12px;
	flex-direction: column;
	@media ( min-width: 780px ) {
		flex-direction: row;
		align-items: stretch;
	}
`;

export const RowWithBorder = styled( Row )`
	border-bottom: 1px solid rgba( 220, 220, 222, 0.64 );
	padding-bottom: 16px;
`;

export const DomainName = styled.div`
	font-size: 16px;
	line-height: 20px;
	color: var( --studio-gray-80 );
	overflow-wrap: break-word;
	max-width: 100%;
	@media ( min-width: 780px ) {
		max-width: 54%;
	}
`;

const SearchButton = styled( Button )`
	align-items: center;
	display: flex;
	font-weight: normal;
	justify-content: center;
	padding: 0 1em;
	transition: 0.1s all linear;
	color: var( --color-text );
	background-color: var( --studio-white );
	border: 1px solid var( --color-neutral-20 );
	border-radius: 4px;
	height: auto;
`;

type ModalContainerProps = {
	isModalOpen: boolean;
	onClose: () => void;
};

type SearchProps = {
	delaySearch: boolean;
	delayTimeout: number;
	describedBy: string;
	dir: 'ltr' | 'rtl' | undefined;
	inputLabel?: string;
	minLength: number;
	maxLength: number;
	onSearch: () => void;
	isReskinned?: boolean;
	childrenBeforeCloseButton?: React.ReactNode;
};

// See p2-pbxNRc-2Ri#comment-4703 for more context
export const MODAL_VIEW_EVENT_NAME = 'calypso_plan_upsell_modal_view';

const Loading = () => {
	const translate = useTranslate();
	return (
		<div>
			{ translate( 'Hold on tight ... your request is being processed by our AI overlords' ) }
		</div>
	);
};

const DomainResults = ( {
	searchProps,
	isLoading,
}: {
	searchProps: SearchProps;
	isLoading: boolean;
} ) => {
	const translate = useTranslate();
	return (
		<>
			<Heading id="plan-upsell-modal-title" shrinkMobileFont>
				{ translate( 'Idea to online at the speed of wow.' ) }
			</Heading>
			<SubHeading id="plan-upsell-modal-description">
				{ translate(
					'Tell us about your idea, product or service in your prompt - and let AI amaze you.'
				) }
			</SubHeading>
			{ isLoading && <Loading /> }

			<ButtonContainer>
				<RowWithBorder></RowWithBorder>
				<Row>
					<Search { ...searchProps }></Search>
				</Row>
			</ButtonContainer>
		</>
	);
};

export default function AIAssistantModal( props: ModalContainerProps ) {
	const { isModalOpen } = props;
	const translate = useTranslate();
	const [ isLoading, setLoading ] = useState( false );
	const [ domainResults, setDomainResults ] = useState( [ {} ] );

	const modalWidth = () => {
		return '639px';
	};

	const onSearch = () => {
		//TODO: Implement search
	};

	const handleButtonClick = () => {
		// Call onSearch or perform the search action here
		setLoading( true );
		setTimeout( () => {
			setLoading( false );
			setDomainResults( [
				{
					domain_name: 'barnyardbazaar.com',
					blog_name: 'barnyard bazaar',
					relevance: 0.99,
					supports_privacy: true,
					vendor: 'donuts',
					match_reasons: [ 'tld-common', 'exact-match' ],
					max_reg_years: 10,
					multi_year_reg_allowed: true,
					product_id: 76,
					product_slug: 'dotblog_domain',
					cost: '\u20b91,809.00',
					renew_cost: '\u20b91,809.00',
					renew_raw_price: 1809,
					raw_price: 1809,
					currency_code: 'INR',
					sale_cost: 180.9,
				},
				{
					domain_name: 'chickenchase.co.uk',
					blog_name: 'chicken chase',
					relevance: 1,
					supports_privacy: true,
					vendor: 'donuts',
					match_reasons: [ 'tld-common', 'similar-match' ],
					max_reg_years: 10,
					multi_year_reg_allowed: true,
					product_id: 6,
					product_slug: 'domain_reg',
					cost: '\u20b91,086.00',
					renew_cost: '\u20b91,086.00',
					renew_raw_price: 1086,
					raw_price: 1086,
					currency_code: 'INR',
				},
			] );
		}, 3000 );
	};

	const searchProps = {
		delaySearch: true,
		delayTimeout: 1000,
		describedBy: 'step-header',
		dir: 'ltr' as const,
		placeholder: translate( 'Type in your prompt.' ),
		minLength: 2,
		maxLength: 60,
		hideOpenIcon: true,
		onSearch: onSearch,
	};
	return (
		<Dialog
			isBackdropVisible
			isVisible={ isModalOpen }
			onClose={ props.onClose }
			additionalClassNames="ai-assistant-modal"
			showCloseIcon
			labelledby="plan-upsell-modal-title"
			describedby="plan-upsell-modal-description"
		>
			<Global
				styles={ css`
					.ai-assistant-modal .dialog__content {
						padding: 0;
					}
					.dialog__backdrop.is-full-screen {
						background-color: rgba( 0, 0, 0, 0.6 );
					}
					.ReactModal__Content--after-open.dialog.card {
						border-radius: 4px;
						width: ${ modalWidth() };
					}
				` }
			/>
			<DialogContainer>
				{ domainResults && <DomainResults searchProps={ searchProps } isLoading={ isLoading } /> }

				{ ! domainResults && (
					<>
						<HeaderImage src={ headerImage } />
						<Heading id="plan-upsell-modal-title" shrinkMobileFont>
							{ translate( 'Idea to online at the speed of wow.' ) }
						</Heading>
						<SubHeading id="plan-upsell-modal-description">
							{ translate(
								'Tell us about your idea, product or service in your prompt - and let AI amaze you.'
							) }
						</SubHeading>
						{ isLoading && <Loading /> }

						<ButtonContainer>
							<RowWithBorder></RowWithBorder>
							<Row>
								<Search { ...searchProps }></Search>
							</Row>
						</ButtonContainer>
					</>
				) }
				{ ! domainResults && (
					<>
						<HeaderImage src={ headerImage } />
						<Heading shrinkMobileFont>
							{ translate( 'Idea to online at the speed of wow.' ) }
						</Heading>
						<SubHeading>
							{ translate(
								'Tell us about your idea, product or service in your prompt - and let AI amaze you.'
							) }
						</SubHeading>
						<ButtonContainer>
							<Row>
								<Search { ...searchProps } />
								<SearchButton onClick={ handleButtonClick }>
									<img src={ AIassistantIllustration } width={ 24 } alt={ translate( 'Submit' ) } />
								</SearchButton>
							</Row>
						</ButtonContainer>
					</>
				) }
			</DialogContainer>
		</Dialog>
	);
}
