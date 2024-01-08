import styled from '@emotion/styled';
import { CustomSelectControl } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import useIntervalOptions from '../hooks/use-interval-options';
import useMaxDiscount from '../hooks/use-max-discount';
import { IntervalTypeProps, SupportedUrlFriendlyTermType } from '../types';
import PopupMessages from './popup-messages';

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
		display: inline-block;
		display: flex;
		line-height: 14px;
		border-radius: 3px;
		line-height: 20px;
	}
	.name {
		margin-right: 4px;
		line-height: 19px;
	}
	.is-highlighted & {
		background-color: #f6f7f7;
	}
	button & {
		padding-right: 32px;
	}
`;

export const IntervalTypeDropdown: React.FunctionComponent< IntervalTypeProps > = ( props ) => {
	const {
		intervalType,
		hideDiscountLabel,
		showBiennialToggle,
		usePricingMetaForGridPlans,
		isInSignup,
	} = props;
	const supportedIntervalType = (
		[ 'yearly', '2yearly', '3yearly', 'monthly' ].includes( intervalType ) ? intervalType : 'yearly'
	) as SupportedUrlFriendlyTermType;
	const [ spanRef, setSpanRef ] = useState< HTMLSpanElement >();
	const optionsList = useIntervalOptions( props );
	const maxDiscount = useMaxDiscount( props.plans, usePricingMetaForGridPlans );
	const popupIsVisible = Boolean( intervalType === 'monthly' && isInSignup && props.plans.length );

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
		<>
			<div
				className="plan-type-selector__interval-type-dropdown-container"
				ref={ intervalType === 'monthly' ? ( ref ) => ref && ! spanRef && setSpanRef( ref ) : null }
			>
				<CustomSelectControl
					className="plan-type-selector__interval-type-dropdown"
					label=""
					options={ selectOptionsList }
					value={ selectOptionsList.find( ( { key } ) => key === supportedIntervalType ) }
				/>
			</div>
			{ ! showBiennialToggle && hideDiscountLabel ? null : (
				<PopupMessages context={ spanRef } isVisible={ popupIsVisible }>
					{ translate(
						'Save up to %(maxDiscount)d%% by paying annually and get a free domain for one year',
						{
							args: { maxDiscount },
							comment: 'Will be like "Save up to 30% by paying annually..."',
						}
					) }
				</PopupMessages>
			) }
		</>
	);
};
