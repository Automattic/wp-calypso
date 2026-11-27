import styled from '@emotion/styled';
import clsx from 'clsx';
import { TranslateResult } from 'i18n-calypso';

type DropdownOptionProps = {
	children: React.ReactNode;
	className?: string;
	title?: TranslateResult;
};

const Container = styled.div`
	.title {
		color: var( --color-text );
		margin-right: 4px;
		line-height: 20px;
	}

	span:not( .title ) {
		color: var( --studio-green-60 );
	}

	/*
	 * CustomSelectControl gives the highlighted option a dark background and light text.
	 * Inherit that text color so the title and discount stay readable on it.
	 */
	[data-active-item] & span {
		color: inherit;
	}
`;

const DropdownOption = ( { children, className, title }: DropdownOptionProps ) => {
	if ( ! title ) {
		return null;
	}

	return (
		<Container className={ clsx( className ) }>
			<span className="title">{ title }</span>
			{ children }
		</Container>
	);
};

export default DropdownOption;
