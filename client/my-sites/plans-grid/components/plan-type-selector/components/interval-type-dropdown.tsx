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

	font-weight: 500;
	padding: 13px 13px 13px 16px;
	font-size: 14px;
	display: flex;
	.discount {
		color: var( --studio-green-50 );
		display: flex;
		line-height: 14px;
		border-radius: 3px;
		line-height: 20px;
	}
	.name {
		margin-right: 4px;
		line-height: 20px;
	}
	.is-highlighted & {
		background-color: #f6f7f7;
	}
	button & {
		padding-right: 32px;
	}
`;

export const IntervalTypeDropdown: React.FunctionComponent< IntervalTypeProps > = ( props ) => {
	const { intervalType, displayedIntervals } = props;
	const supportedIntervalType = (
		displayedIntervals.includes( intervalType ) ? intervalType : 'yearly'
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
		<div className="plan-type-selector__interval-type-dropdown-container">
			<CustomSelectControl
				className="plan-type-selector__interval-type-dropdown"
				label=""
				options={ selectOptionsList }
				value={ selectOptionsList.find( ( { key } ) => key === supportedIntervalType ) }
			/>
		</div>
	);
};
