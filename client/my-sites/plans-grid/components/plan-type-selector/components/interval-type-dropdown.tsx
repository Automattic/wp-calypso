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
`;

export const IntervalTypeDropdown: React.FunctionComponent< IntervalTypeProps > = ( props ) => {
	const { intervalType } = props;
	const dropdownRef = useRef( null );
	const [ isMobileState, setIsMobileState ] = useState( isMobile() );
	const [ isDropdownVisible, setIsDropdownVisible ] = useState( true );

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
				if ( entry.intersectionRatio === 1 ) {
					setIsDropdownVisible( true );
					return;
				}
				setIsDropdownVisible( false );
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
	}, [] );

	return (
		<div
			className={ `${ isDropdownVisible }_${ isMobileState }` }
			style={ { visibility: isDropdownVisible ? 'visible' : 'hidden' } }
			ref={ dropdownRef }
		>
			<StyledCustomSelectControl
				label=""
				options={ selectOptionsList }
				value={ selectOptionsList.find( ( { key } ) => key === supportedIntervalType ) }
			/>
		</div>
	);
};
