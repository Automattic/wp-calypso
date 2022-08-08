import { LoadingPlaceholder } from '@automattic/components';
import { css } from '@emotion/css';
import styled from '@emotion/styled';

type cssSize = number | string;

interface LoadingLogoProps {
	width: cssSize;
	height: cssSize;
}

interface SitesTableRowLoadingProps {
	columns?: number;
	logoProps?: LoadingLogoProps;
	delayMS?: number;
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

const TitleRow = styled.div`
	display: flex;
`;

const FullWidth = styled.div`
	width: 100%;
`;

const LoadingLogo = styled( LoadingPlaceholder )< LoadingLogoProps >`
	${ ( { width, height } ) => ( {
		maxWidth: width,
		height,
	} ) }
	margin-right: 10px;
`;

const LoadingTitle = styled( LoadingPlaceholder )`
	max-width: 80%;
	margin-bottom: 10px;
`;

const LoadingDomain = styled( LoadingPlaceholder )`
	max-width: 40%;
`;

export default function SitesTableRowLoading( {
	columns = 2,
	logoProps = { width: 50, height: 50 },
	delayMS = 0,
}: SitesTableRowLoadingProps ) {
	return (
		<Row>
			<Column>
				<TitleRow>
					<LoadingLogo
						className={ css( { borderRadius: 4 } ) }
						{ ...logoProps }
						delayMS={ delayMS }
					/>
					<FullWidth>
						<LoadingTitle delayMS={ delayMS } />
						<LoadingDomain delayMS={ delayMS } />
					</FullWidth>
				</TitleRow>
			</Column>
			{ Array( columns - 1 )
				.fill( null )
				.map( ( _, i ) => (
					<Column mobileHidden key={ i }>
						<LoadingPlaceholder className={ css( { maxWidth: 70 } ) } delayMS={ delayMS } />
					</Column>
				) ) }
		</Row>
	);
}
