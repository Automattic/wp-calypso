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
		color: var( --studio-green-40 );
		display: inline-block;
		font-size: 0.7rem;
	}
	.name {
		font-size: 0.8rem;
		margin-right: 4px;
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
				<span className="discount"> { option.discountText } </span>
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
