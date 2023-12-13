import { isMobile } from '@automattic/viewport';
import styled from '@emotion/styled';
import { CustomSelectControl } from '@wordpress/components';
import { useLayoutEffect, useRef, useState } from 'react';
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
		font-size: 14px;
	}
	.name {
		font-size: 14px;
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
		min-width: 246px;
	}
	.components-custom-select-control__menu {
		margin: 0;
		z-index: 3;
	}
	div.components-input-control__backdrop.components-input-control__backdrop.components-input-control__backdrop.components-input-control__backdrop {
		border: 1px solid var( --studio-gray-10 );
	}

	.components-input-control__container {
		padding: 8px;
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
	.components-input-control__backdrop.components-input-control__backdrop.components-input-control__backdrop.components-input-control__backdrop {
		border: none;
		border-bottom: 1px solid #e0e0e0;
	}
`;

export const IntervalTypeDropdown: React.FunctionComponent< IntervalTypeProps > = ( props ) => {
	const { intervalType } = props;
	const dropdownRef = useRef( null );
	const [ isMobileState, setIsMobileState ] = useState( isMobile() );
	const [ isStickyDropdownVisible, setIsStickyDropdownVisible ] = useState( false );

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
	setIsStickyDropdownVisible;
	useLayoutEffect( () => {
		const onResize = () => {
			setIsMobileState( isMobile() );
		};
		addEventListener( 'resize', onResize );
		return () => {
			removeEventListener( 'resize', onResize );
		};
	}, [] );
	useLayoutEffect( () => {
		if ( typeof IntersectionObserver === 'undefined' ) {
			return;
		}
		const observer = new IntersectionObserver(
			( [ entry ] ) => {
				if ( ! isMobileState ) {
					// If the viewport is mobile, the sticky dropdown will be disabled
					if ( isStickyDropdownVisible ) {
						setIsStickyDropdownVisible( false );
					}
					return;
				}
				if ( entry.intersectionRatio === 1 ) {
					// If the original dropdown is fully visible in the viewport, the sticky dropdown will be hidden
					setIsStickyDropdownVisible( false );
					return;
				} else if ( entry.boundingClientRect.top > 0 ) {
					// If the original dropdown is below the viewport, the sticky dropdown will be hidden
					setIsStickyDropdownVisible( false );
					return;
				}
				setIsStickyDropdownVisible( true );
			},
			{
				rootMargin: `-${ 0 + 1 }px 0px 0px 0px`,
				threshold: [ 0, 1 ],
			}
		);

		if ( dropdownRef.current ) {
			observer.observe( dropdownRef.current );
		}

		return () => {
			observer.disconnect();
		};
	}, [ isStickyDropdownVisible, isMobileState ] );

	return (
		<>
			<div className={ `${ isStickyDropdownVisible }_${ isMobileState }` } ref={ dropdownRef }>
				{ ! isStickyDropdownVisible && (
					<StyledCustomSelectControl
						isStickyDropdownVisible={ isStickyDropdownVisible }
						label=""
						options={ selectOptionsList }
						value={ selectOptionsList.find( ( { key } ) => key === supportedIntervalType ) }
					/>
				) }
			</div>
			{ isStickyDropdownVisible && (
				<StickyDropdown
					isStickyDropdownVisible={ isStickyDropdownVisible }
					label=""
					options={ selectOptionsList }
					value={ selectOptionsList.find( ( { key } ) => key === supportedIntervalType ) }
				/>
			) }
		</>
	);
};
