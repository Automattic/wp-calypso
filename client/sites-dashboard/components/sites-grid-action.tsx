import { Gridicon } from '@automattic/components';
import { css } from '@emotion/css';

interface SitesGridActionCTA extends React.ButtonHTMLAttributes< HTMLAnchorElement > {
	title: string;
	href: string;
	children?: React.ReactNode;
	onClick?: () => void;
}

interface SitesGridActionProps {
	children: React.ReactNode;
	icon?: string;
	ctaProps?: SitesGridActionCTA | false;
}

const SITES_GRID_ACTION = css( {
	'--color-site-grid-action-icon': '#ea303f',
	display: 'flex',
	alignItems: 'center',
	position: 'absolute',
	backgroundColor: 'var(--studio-white)',
	padding: '16px 20px',
	boxSizing: 'border-box',
	borderRadius: 4,
	left: 6,
	top: 6,
	width: 'calc( 100% - 12px )',
	boxShadow: '0 0 4px var(--studio-gray-60)',
} );

const CONTENT = css( {
	display: 'flex',
	alignItems: 'center',
	marginRight: 16,
	'.gridicon': {
		color: 'var(--color-site-grid-action-icon)',
		marginRight: 4,
		flexShrink: 0,
	},
} );

const CTA = css( {
	'--color-link': '#111619',
	marginLeft: 'auto',
	textDecoration: 'underline',
	textUnderlineOffset: 4,
	'&:hover': {
		textDecoration: 'none',
	},
} );

export function SitesGridAction( { children, icon, ctaProps, ...props }: SitesGridActionProps ) {
	return (
		<div className={ SITES_GRID_ACTION } { ...props }>
			<div className={ CONTENT }>
				{ /* eslint-disable-next-line wpcalypso/jsx-gridicon-size */ }
				{ icon && <Gridicon icon={ icon } size={ 20 } /> }
				{ children }
			</div>
			{ ctaProps && (
				<a className={ CTA } { ...ctaProps } children={ ctaProps.children || ctaProps.title } />
			) }
		</div>
	);
}
