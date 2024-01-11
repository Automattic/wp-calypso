import styled from '@emotion/styled';
import { CustomSelectControl } from '@wordpress/components';
// TODO: Check if the ReactNode type exists in @wordpress/element
import React from 'react';
import { Link } from 'react-router-dom';
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

const ConditionalIntervalTypeOption = ( {
	isPlansInsideStepper,
	href,
	children,
}: {
	isPlansInsideStepper: boolean;
	href: string;
	// TODO: Verify children type
	children: React.ReactNode[];
} ) => {
	// TODO: Consider using generatePath helper
	return isPlansInsideStepper ? (
		<Link to={ href }>{ children }</Link>
	) : (
		<AddOnOption href={ href }>{ children }</AddOnOption>
	);
};

export const IntervalTypeDropdown: React.FunctionComponent< IntervalTypeProps > = ( props ) => {
	const { intervalType, displayedIntervals, isPlansInsideStepper } = props;
	const supportedIntervalType = (
		displayedIntervals.includes( intervalType ) ? intervalType : 'yearly'
	) as SupportedUrlFriendlyTermType;
	const optionsList = useIntervalOptions( props );

	const selectOptionsList = Object.values( optionsList ).map( ( option ) => ( {
		key: option.key,
		name: (
			<ConditionalIntervalTypeOption
				href={ option.url }
				isPlansInsideStepper={ isPlansInsideStepper }
			>
				<span className="name"> { option.name } </span>
				{ option.discountText ? <span className="discount"> { option.discountText } </span> : null }
			</ConditionalIntervalTypeOption>
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
