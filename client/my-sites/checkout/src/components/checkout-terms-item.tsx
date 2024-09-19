import styled from '@emotion/styled';
import clsx from 'clsx';
import type { MouseEventHandler, PropsWithChildren } from 'react';

const Wrapper = styled.div`
	padding-left: 0px;
	position: relative;
	font-size: 12px;

	> svg {
		position: absolute;
		top: 0;
		left: 0;
		width: 16px;
		height: 16px;

		.rtl & {
			left: auto;
			right: 0;
		}
	}

	p {
		font-size: 12px;
		word-break: break-word;
	}
`;

const CheckoutTermsItem = ( {
	children,
	className,
	onClick,
	isPrewrappedChildren,
}: PropsWithChildren< {
	className?: string;
	onClick?: MouseEventHandler< HTMLDivElement >;
	isPrewrappedChildren?: boolean;
} > ) => {
	return (
		<Wrapper className={ clsx( 'checkout__terms-item', className ) } onClick={ onClick }>
			{ isPrewrappedChildren ? children : <p>{ children }</p> }
		</Wrapper>
	);
};

export default CheckoutTermsItem;
