import styled from '@emotion/styled';
import classnames from 'classnames';
import { TranslateResult } from 'i18n-calypso';

type DropdownOptionProps = {
	children: React.ReactNode;
	className?: string;
	title?: TranslateResult;
};

const Container = styled.div`
	& span.title,
	&:visited span.title,
	&:hover span.title {
		color: var( --color-text );
	}

	span {
		color: var( --studio-green-50 );
	}

	font-weight: 500;

	.title {
		margin-right: 4px;
		line-height: 20px;
	}
	.is-highlighted & {
		background-color: #f6f7f7;
	}
`;

const DropdownOption = ( { children, className, title }: DropdownOptionProps ) => {
	if ( ! title ) {
		return null;
	}

	return (
		<Container className={ classnames( className ) }>
			<span className="title">{ title }</span>
			{ children }
		</Container>
	);
};

export default DropdownOption;
