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
	display: 'flex',
	alignItems: 'center',
	position: 'absolute',
	top: 0,
	width: '100%',
	backgroundColor: 'var(--studio-gray-0)',
	padding: '16px 22px',
	boxSizing: 'border-box',
	borderRadius: 10,
} );

const CONTENT = css( {
	'--color-site-grid-action-icon': 'var(--color-error-50)',
	display: 'flex',
	alignItems: 'center',
	marginRight: 16,
	'.gridicon': {
		color: 'var(--color-site-grid-action-icon)',
		marginRight: 16,
		flexShrink: 0,
	},
} );

const CTA = css( {
	marginLeft: 'auto',
	textDecoration: 'underline',
	textUnderlineOffset: 4,
	'&:hover': {
		textDecoration: 'none',
	},
} );

export function SitesGridAction( { children, icon, ctaProps, ...props }: SitesGridActionProps ) {
	// const { ref, inView: inViewOnce } = useInView( { triggerOnce: true } );
	// useEffect( () => {
	// 	if ( inViewOnce ) {
	// 		recordTracksEvent( PLAN_RENEW_NAG_IN_VIEW, {
	// 			is_site_owner: isSiteOwner,
	// 			product_slug: plan.product_slug,
	// 		} );
	// 	}
	// }, [ inViewOnce, isSiteOwner, plan.product_slug ] );
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
