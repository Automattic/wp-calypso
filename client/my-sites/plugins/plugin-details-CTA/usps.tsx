import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';

const StyledUl = styled.ul`
	margin-top: 20px;
	margin-left: 0;
	list-style-type: none;
`;

const StyledLi = styled.li`
	color: var( --studio-gray-50 );
	font-size: 12px;
	display: flex;
	align-items: center;
	margin: 5px 0;

	.title {
		color: var( --studio-gray-50 );
		font-size: 14px;
		font-weight: 500;
		margin-top: 10px;
	}

	svg {
		margin-right: 8px;
	}
`;

interface Props {
	shouldUpgrade: boolean;
	isFreePlan: boolean;
	isMarketplaceProduct: boolean;
}

const USPS: React.FC< Props > = ( { shouldUpgrade, isFreePlan, isMarketplaceProduct } ) => {
	const translate = useTranslate();

	const filteredUSPS = [
		...( isMarketplaceProduct
			? [
					{
						id: 'updates',
						image: <Gridicon icon="gift" size={ 16 } />,
						text: translate( 'Plugin updates' ),
						eligibilities: [ 'marketplace' ],
					},
			  ]
			: [] ),
		...( isMarketplaceProduct
			? [
					{
						id: 'refund',
						image: <Gridicon icon="refund" size={ 16 } />,
						text: translate( '30 day money-back guarantee' ),
						eligibilities: [ 'marketplace' ],
					},
			  ]
			: [] ),
		...( shouldUpgrade
			? [
					{
						id: 'plan',
						className: 'title',
						text: translate( 'Included in the Business plan' ),
						eligibilities: [ 'needs-upgrade' ],
					},
			  ]
			: [] ),
		...( isFreePlan
			? [
					{
						id: 'domain',
						image: <Gridicon icon="domains" size={ 16 } />,
						text: translate( 'Free domain for one year' ),
						eligibilities: [ 'free-plan' ],
					},
			  ]
			: [] ),
		...( shouldUpgrade
			? [
					{
						id: 'hosting',
						image: <Gridicon icon="star-outline" size={ 16 } />,
						text: translate( 'Best-in-class hosting' ),
						eligibilities: [ 'needs-upgrade' ],
					},
			  ]
			: [] ),
		...( shouldUpgrade || isMarketplaceProduct
			? [
					{
						id: 'support',
						image: <Gridicon icon="chat" size={ 16 } />,
						text: translate( 'Live chat support 24x7' ),
						eligibilities: [ 'needs-upgrade', 'marketplace' ],
					},
			  ]
			: [] ),
	];

	return (
		<StyledUl>
			{ filteredUSPS.map( ( usp ) => (
				<StyledLi key={ usp.id }>
					{ usp?.image }
					<span className={ usp.className }>{ usp.text }</span>
				</StyledLi>
			) ) }
		</StyledUl>
	);
};

export default USPS;
