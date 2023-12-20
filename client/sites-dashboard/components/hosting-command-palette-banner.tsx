import styled from '@emotion/styled';
import { __ } from '@wordpress/i18n';
import DismissibleCard from 'calypso/blocks/dismissible-card';

const Root = styled.div( {
	marginBottom: 20,
	'.hosting-command-palette-banner': {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'left',
		border: '1px solid var(--color-border-subtle)',
		borderLeftWidth: 3,
		borderLeftColor: 'var(--color-accent)',
		borderLeftStyle: 'solid',
		boxShadow: 'none',
		padding: '10px 12px',
	},
	'.dismissible-card__close-button': {
		top: 20,
		right: 20,
	},
} );

const BannerTitle = styled.div( {
	fontSize: 14,
	fontWeight: 600,
} );

const BannerDescription = styled.div( {
	display: 'flex',
	color: 'var(--Gray-Gray-70, #3C434A)',
	fontSize: 14,
} );

interface HostingCommandPaletteBannerProps {
	className?: string;
}

interface ShortcutIconProps {
	size: 'big' | 'small';
}

const StyledShortcut = styled.div< ShortcutIconProps >( ( props ) =>
	props.size === 'big'
		? {
				fontWeight: 600,
				fontSize: 20,
				border: '2px solid',
				borderRadius: 1.38,
				padding: '0px 5px',
				marginRight: 9,
		  }
		: {
				fontWeight: 600,
				fontSize: 14,
				backgroundColor: '#EEE',
				color: '#3C434A',
				margin: '0 5px',
				padding: '0 4px',
				borderRadius: 2,
		  }
);

const ShortcutIcon = ( { size }: ShortcutIconProps ) => {
	const isMac = navigator.userAgent.indexOf( 'Mac' ) > -1;
	const shortcut = isMac ? '⌘K' : 'Ctrl+K';
	return <StyledShortcut size={ size }>{ shortcut }</StyledShortcut>;
};

export function HostingCommandPaletteBanner( { className }: HostingCommandPaletteBannerProps ) {
	return (
		<Root>
			<DismissibleCard
				preferenceName="hosting-command-palette-banner-display"
				className={ `hosting-command-palette-banner card banner upsell-nudge is-dismissible is-card-link ${ className }` }
			>
				<ShortcutIcon size="big" />
				<div>
					<BannerTitle>{ __( 'The Command Palette is here' ) }</BannerTitle>
					<BannerDescription>
						<span>{ __( 'Access features and trigger commands quickly. Press' ) }</span>{ ' ' }
						<ShortcutIcon size="small" /> <span>{ __( 'to launch the Command Palette.' ) }</span>
					</BannerDescription>
				</div>
			</DismissibleCard>
		</Root>
	);
}
