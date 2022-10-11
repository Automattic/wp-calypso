import styled from '@emotion/styled';
import { CSSProperties } from 'react';

type Props = {
	siteName?: string;
	className?: string;
	style?: CSSProperties;
	lang: string;
};

const Root = styled.div( {
	display: 'flex',
	alignItems: 'center',
	backgroundColor: '#117ac9',
	borderRadius: 4,
	boxSizing: 'border-box',
} );

export const SiteComingSoon = ( { siteName = '', lang = '', className, style }: Props ) => {
	return (
		<Root className={ className } style={ style } data-testid="site-coming-soon">
			<svg width="100%" viewBox="0 0 375 272" fill="none" xmlns="http://www.w3.org/2000/svg">
				<text
					fill="white"
					fontFamily="Recoleta, Georgia, 'Times New Roman', Times, serif"
					fontSize="30"
				>
					<tspan x="31" y="153.016">
						{ /** todo: translate to site language */ }
						{ `Coming soon ( ${ lang } )` }
					</tspan>
				</text>
				<text
					fill="white"
					fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen-Sans", "Ubuntu", "Cantarell", "Helvetica Neue", sans-serif'
					fontSize="14"
				>
					<tspan x="31" y="120.102">
						{ siteName }
					</tspan>
				</text>
			</svg>
		</Root>
	);
};
