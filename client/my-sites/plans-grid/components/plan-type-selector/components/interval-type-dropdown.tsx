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
		margin-right: 4px;
	}
`;

const StyledCustomSelectControl = styled( CustomSelectControl )`
	&,
	&:visited,
	&:hover span.name {
		color: var( --color-text );
	}
	.components-custom-select-control__button {
		min-width: 225px;
	}
	.components-custom-select-control__menu {
		margin: 0;
	}
	.components-custom-select-control__item {
		grid-template-columns: auto min-content;
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
		<StyledCustomSelectControl
			label=""
			options={ selectOptionsList }
			value={ selectOptionsList.find( ( { key } ) => key === supportedIntervalType ) }
		/>
	);
};
