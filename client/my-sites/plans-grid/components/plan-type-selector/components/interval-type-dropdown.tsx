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

const StickyDropdown = styled( CustomSelectControl )`
	.components-flex {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 48px;
		z-index: 2;
	}

	.components-custom-select-control__menu {
		position: fixed;
		left: 0;
		top: 47px;
		width: 100%;
		margin: 0;
		z-index: 3;

		border: 1px solid #e0e0e0;
	}

	.components-custom-select-control__item {
		grid-template-columns: auto min-content;
	}

	.components-input-control__backdrop.components-input-control__backdrop.components-input-control__backdrop.components-input-control__backdrop {
		border: none;
		border-bottom: 1px solid #e0e0e0;
	}
`;

export const IntervalTypeDropdown: React.FunctionComponent< IntervalTypeProps > = ( props ) => {
	const { intervalType, isStuck } = props;
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
		<>
			{ isStuck ? (
				<StickyDropdown
					label=""
					options={ selectOptionsList }
					value={ selectOptionsList.find( ( { key } ) => key === supportedIntervalType ) }
				/>
			) : (
				<StyledCustomSelectControl
					label=""
					options={ selectOptionsList }
					value={ selectOptionsList.find( ( { key } ) => key === supportedIntervalType ) }
				/>
			) }
		</>
	);
};
