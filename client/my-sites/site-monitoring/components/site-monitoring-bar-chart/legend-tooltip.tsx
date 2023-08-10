import styled from '@emotion/styled';

const Root = styled.div( {
	fontSize: 14,
	maxWidth: 350,
	padding: 16,
	textAlign: 'left',
	color: 'var(--color-neutral-50)',
} );

const Title = styled.div( {
	fontWeight: 600,
} );

export function LegendTooltip( {
	title,
	children,
}: {
	title?: string;
	children?: React.ReactNode;
} ) {
	return (
		<Root>
			{ title && <Title>{ title }</Title> }
			<div>{ children }</div>
		</Root>
	);
}
