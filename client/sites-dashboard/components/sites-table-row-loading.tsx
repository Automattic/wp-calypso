import styled from '@emotion/styled';

const Row = styled.tr`
	line-height: 2em;
	border-bottom: 1px solid #eee;
`;

const Column = styled.td< { mobileHidden?: boolean } >`
	padding-top: 12px;
	padding-bottom: 12px;
	padding-right: 24px;
	vertical-align: top;
`;

const Loading = styled.div`
	animation: pulse-light 1.8s ease-in-out infinite;
	background-color: var( --color-neutral-10 );
	height: 18px;
	max-width: 70px;
`;

const TitleRow = styled.div`
	display: flex;
`;

const FullWidth = styled.div`
	width: 100%;
`;

const LoadingLogo = styled( Loading )`
	width: 50px;
	height: 50px;
	margin-right: 10px;
`;

const LoadingTitle = styled( Loading )`
	max-width: 80%;
	margin-bottom: 10px;
`;

const LoadingDomain = styled( Loading )`
	max-width: 40%;
`;

export default function SitesTableRowLoading() {
	return (
		<Row>
			<Column>
				<TitleRow>
					<LoadingLogo />
					<FullWidth>
						<LoadingTitle />
						<LoadingDomain />
					</FullWidth>
				</TitleRow>
			</Column>
			<Column mobileHidden>
				<Loading />
			</Column>
			<Column mobileHidden>
				<Loading />
			</Column>
			<Column mobileHidden>
				<Loading />
			</Column>
			<Column />
		</Row>
	);
}
