import styled from '@emotion/styled';
import { CustomSelectControl } from '@wordpress/components';
import useIntervalOptions from '../hooks/use-interval-options';
import { IntervalTypeProps, SupportedUrlFriendlyTermType } from '../types';

const AddOnOption = styled.a`
	& span.name,
	&:visited span.name,
	&:hover span.name {
		color: var( --color-text );
	}
	.discount {
		background-color: var( --studio-green-0 );
		color: var( --studio-green-50 );
		display: inline-block;
		font-size: 0.7rem;
		display: flex;
		padding: 0px 10px;
		line-height: 14px;
		border-radius: 3px;
		line-height: 20px;
	}
	.name {
		font-size: 0.8rem;
		margin-right: 4px;
		line-height: 19px;
	}
	padding: 16px;
	padding-right: 25px;
	display: flex;
	justify-content: space-between;
	.is-highlighted & {
		background-color: #f6f7f7;
	}
`;

export const IntervalTypeDropdown: React.FunctionComponent< IntervalTypeProps > = ( props ) => {
	const { intervalType } = props;
	const supportedIntervalType = (
		[ 'yearly', '2yearly', '3yearly', 'monthly' ].includes( intervalType ) ? intervalType : 'yearly'
	) as SupportedUrlFriendlyTermType;
	const optionsList = useIntervalOptions( props );
	const selectOptionsList = Object.values( optionsList ).map( ( option ) => ( {
		key: option.key,
		name: (
			<AddOnOption href={ option.url }>
				<span className="name"> { option.name } </span>
				{ option.discountText ? <span className="discount"> { option.discountText } </span> : null }
			</AddOnOption>
		),
	} ) );

	return (
		<CustomSelectControl
			className="plan-type-selector__interval-type-dropdown"
			label=""
			options={ selectOptionsList }
			value={ selectOptionsList.find( ( { key } ) => key === supportedIntervalType ) }
		/>
	);
};
