import styled from '@emotion/styled';

type cssSize = number | string;

interface LoadingLogoProps {
	width: cssSize;
	height: cssSize;
}

interface SitesTableRowLoadingProps {
	columns?: number;
	logoProps?: LoadingLogoProps;
}

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

const LoadingLogo = styled( Loading )< LoadingLogoProps >`
	${ ( { width, height } ) => ( {
		width,
		height,
	} ) }
	margin-right: 10px;
`;

const LoadingTitle = styled( Loading )`
	max-width: 80%;
	margin-bottom: 10px;
`;

const LoadingDomain = styled( Loading )`
	max-width: 40%;
`;

export default function SitesTableRowLoading( {
	columns = 2,
	logoProps = { width: 50, height: 50 },
}: SitesTableRowLoadingProps ) {
	return (
		<Row>
			<Column>
				<TitleRow>
					<LoadingLogo { ...logoProps } />
					<FullWidth>
						<LoadingTitle />
						<LoadingDomain />
					</FullWidth>
				</TitleRow>
			</Column>
			{ Array( columns - 1 ).fill(
				<Column mobileHidden>
					<Loading />
				</Column>
			) }
		</Row>
	);
}
