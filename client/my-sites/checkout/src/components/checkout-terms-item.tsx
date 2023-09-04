import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import classNames from 'classnames';
import type { MouseEventHandler, PropsWithChildren } from 'react';

const Wrapper = styled.div`
	padding-left: 24px;
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
		margin: 0;
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
		<Wrapper className={ classNames( 'checkout__terms-item', className ) } onClick={ onClick }>
			<Gridicon icon="info-outline" size={ 18 } />
			{ isPrewrappedChildren ? children : <p>{ children }</p> }
		</Wrapper>
	);
};

export default CheckoutTermsItem;
