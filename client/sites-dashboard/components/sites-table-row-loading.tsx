import { LoadingPlaceholder } from '@automattic/components';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { MEDIA_QUERIES } from '../utils';

type cssSize = number | string;

interface LoadingLogoProps {
	width?: cssSize;
	height?: cssSize;
}

interface SitesTableRowLoadingProps {
	columns?: number;
	logoProps?: LoadingLogoProps;
	delayMS?: number;
}

const Row = styled.tr`
	line-height: 2em;
	border-block-end: 1px solid #eee;
`;

const Column = styled.td< { mobileHidden?: boolean } >`
	padding-block-start: 12px;
	padding-block-end: 12px;
	padding-inline-end: 24px;
	vertical-align: middle;
	${ MEDIA_QUERIES.mediumOrSmaller } {
		${ ( props ) => props.mobileHidden && 'display: none;' };
	}
`;

const TitleRow = styled.div`
	display: flex;
	align-items: center;
`;

const FullWidth = styled.div`
	width: 100%;
`;

const LoadingLogo = styled( LoadingPlaceholder )< LoadingLogoProps >`
	${ ( { width, height } ) => ( {
		maxWidth: width,
		height,
	} ) }
	margin-inline-end: 10px;
`;

const LoadingTitle = styled( LoadingPlaceholder )`
	max-width: 80%;
	margin-block-end: 10px;
`;

const LoadingDomain = styled( LoadingPlaceholder )`
	max-width: 40%;
`;

export default function SitesTableRowLoading( {
	columns = 2,
	logoProps = {},
	delayMS = 0,
}: SitesTableRowLoadingProps ) {
	return (
		<Row>
			<Column>
				<TitleRow>
					<LoadingLogo
						className={ css( { borderRadius: 4 } ) }
						width={ 50 }
						height={ 50 }
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
