import { css, keyframes } from '@emotion/css';
import styled from '@emotion/styled';
import { __, isRTL } from '@wordpress/i18n';
import classnames from 'classnames';

type Props = {
	siteName?: string;
	className?: string;
	lang?: string;
	width: number;
	height: number;
	showLoader?: boolean;
};

const shimmer = keyframes( {
	'0%': {
		backgroundPosition: '0 -1200px',
	},
	'100%': {
		backgroundPosition: '0 1200px',
	},
} );

const Loader = css( {
	'&::before': {
		content: "''",
		animationDuration: '2.4s',
		animationFillMode: 'forwards',
		animationIterationCount: 'infinite',
		animationName: shimmer,
		animationTimingFunction: 'linear',
		background: 'linear-gradient(to top, transparent 8%, #f0f0f066 18%, transparent 33%)',
		backgroundSize: '100% 1200px',
		width: '100%',
		height: '100%',
		position: 'absolute',
		left: 0,
		top: 0,
		zIndex: 1,
		display: 'inline-table',
	},
} );

const Root = styled.div( {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	backgroundColor: '#117ac9',
	borderRadius: 4,
	boxSizing: 'border-box',
	border: '1px solid rgb(238, 238, 238)',
	position: 'relative',
	overflow: 'hidden',
} );

const comingSoonTranslations: Record< string, string > = {
	ar: 'قريبًا',
	de: 'Demnächst verfügbar',
	en: 'Coming Soon',
	es: 'Próximamente',
	fr: 'Bientôt disponible',
	he: 'בקרוב',
	id: 'Segera hadir',
	it: 'Presto disponibile',
	ja: '近日公開',
	ko: '공개 예정',
	nb: 'Kommer snart',
	nl: 'Komt binnenkort',
	pt: 'Em breve',
	ro: 'În curând',
	ru: 'Скоро будет',
	skr: 'جلدی آندا پئے',
	sv: 'Kommer snart',
	tr: 'Pek yakında',
	zh: '即将推出',
};

const getTranslation = ( lang?: string ) => {
	let text = __( 'Coming Soon' );
	let isRtl = isRTL();

	if ( lang ) {
		lang = lang.split( '-' )[ 0 ];
		if ( comingSoonTranslations[ lang ] ) {
			text = comingSoonTranslations[ lang ];
			isRtl = lang === 'ar' || lang === 'he';
		}
	}

	return { text, isRtl };
};

export const SiteComingSoon = ( {
	siteName = '',
	className,
	lang,
	width,
	height,
	showLoader,
}: Props ) => {
	const { text: comingSoon, isRtl } = getTranslation( lang );
	const x = isRtl ? 375 - 31 : 31;
	return (
		<Root className={ classnames( { [ Loader ]: showLoader }, className ) }>
			<svg
				width={ width }
				height={ height }
				viewBox="0 0 375 272"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				textAnchor="start"
				direction={ isRtl ? 'rtl' : 'ltr' }
			>
				<title>{ comingSoon }</title>
				<text
					fill="white"
					fontFamily="Recoleta, Georgia, 'Times New Roman', Times, serif"
					fontSize="30"
				>
					<tspan x={ x } y="153.016">
						{ comingSoon }
					</tspan>
				</text>
				<text
					fill="white"
					fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen-Sans", "Ubuntu", "Cantarell", "Helvetica Neue", sans-serif'
					fontSize="14"
				>
					<tspan x={ x } y="120.102">
						{ siteName }
					</tspan>
				</text>
			</svg>
		</Root>
	);
};
