import { Gridicon } from '@automattic/components';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { useMediaQuery } from '@wordpress/compose';
import {
	globe as domainsIcon,
	plus as plusIcon,
	settings as settingsIcon,
	tool as toolIcon,
	wordpress as wordpressIcon,
} from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import DismissibleCard from 'calypso/blocks/dismissible-card';

const HostingCommandPaletteBannerRoot = styled.div( {
	'&:not(:empty)': {
		marginBottom: 25,
		marginTop: 25,
	},
	'.hosting-command-palette-banner': {
		background: 'linear-gradient(270deg, #E9EFF5 12.03%, rgba(233, 239, 245, 0) 40.39%)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'left',
		borderLeftWidth: 3,
		borderLeftColor: 'var(--color-accent)',
		borderLeftStyle: 'solid',
		padding: '10px 56px 10px 12px',
	},
	'.dismissible-card__close-button': {
		top: 'calc(50% - 12px)',
		right: 20,
	},
} );

const fadeIn = keyframes`
  0% {
    transform: translateX(15%);
    opacity: 0;
  }
  50% {
	transform: translateX(-1%);
	opacity: 1;
  }
  100% {
	opacity: 1,
    transform: translateX(0);
  }
`;

const fadeOut = keyframes`
  0% {
    transform: translateX(0%);
	opacity: 1;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 0;
	transform: translateX(-50%);
  }
`;

const CommandBoxWrapper = styled.div( {
	marginLeft: 'auto',
	display: 'grid',
	gridTemplateColumns: '1fr',
	flexGrow: 1,
	userSelect: 'none',
	'@media ( max-width: 810px )': {
		display: 'none',
	},
} );

const CommandBox = styled.div( {
	gridRowStart: 1,
	gridColumnStart: 1,
	borderRadius: 2,
	display: 'flex',
	justifyContent: 'flex-start',
	alignItems: 'center',
	marginLeft: 'auto',
	minWidth: 253,
	fontSize: 13,
	lineHeight: '20px',
	letterSpacing: -0.15,
	backgroundColor: 'var(--color-surface)',
	boxShadow: '1px 1px 1px 0px #0000001F',
	paddingRight: 10,
	whiteSpace: 'nowrap',
	'&.command-box__fadeIn': {
		animation: `${ fadeIn } 1s ease-in-out`,
		zIndex: 10,
	},
	'&.command-box__fadeOut': {
		animation: `${ fadeOut } 1s ease-in-out`,
		zIndex: 5,
		opacity: 0,
	},
	svg: {
		width: 24,
		height: 24,
		margin: 8,
	},
} );

const BannerTitle = styled.div( {
	fontSize: 14,
	fontWeight: 600,
} );

const BannerDescription = styled.div( {
	color: 'var(--Gray-Gray-70, #3C434A)',
	fontSize: 14,
	paddingRight: 20,
} );

interface HostingCommandPaletteBannerProps {
	className?: string;
}

interface ShortcutIconProps {
	size: 'big' | 'small';
}

const StyledShortcut = styled.span< ShortcutIconProps >( ( props ) =>
	props.size === 'big'
		? {
				fontWeight: 600,
				fontSize: 20,
				border: '1px solid',
				borderRadius: 2,
				padding: '0px 8px',
				marginRight: 12,
		  }
		: {
				fontWeight: 600,
				fontSize: 14,
				backgroundColor: '#EEE',
				color: '#3C434A',
				padding: '0 4px',
				borderRadius: 2,
		  }
);

const ShortcutIcon = ( { size }: ShortcutIconProps ) => {
	const isMac = navigator.userAgent.indexOf( 'Mac' ) > -1;
	const shortcut = isMac ? '⌘K' : 'Ctrl+K';
	return <StyledShortcut size={ size }>{ shortcut }</StyledShortcut>;
};

const AnimatedCommand = () => {
	const { __ } = useI18n();
	const prefersReducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
	const commands = [
		{ icon: domainsIcon, label: __( 'Register new domain' ) },
		{ icon: <Gridicon icon="reader" />, label: __( 'Open Reader' ) },
		{ icon: plusIcon, label: __( 'Add new post' ) },
		{ icon: wordpressIcon, label: __( 'View my sites' ) },
		{ icon: settingsIcon, label: __( 'Open server settings' ) },
		{ icon: toolIcon, label: __( 'Change PHP version' ) },
		{ icon: toolIcon, label: __( 'Manage staging sites' ) },
	];

	const [ currentCommandIndex, setCurrentCommandIndex ] = useState( 0 );

	useEffect( () => {
		if ( prefersReducedMotion ) {
			return;
		}

		const interval = setInterval( () => {
			setCurrentCommandIndex( ( prevIndex ) => ( prevIndex + 1 ) % commands.length );
		}, 3000 );

		return () => clearInterval( interval );
	}, [ prefersReducedMotion, commands.length ] );

	if ( prefersReducedMotion ) {
		return null;
	}
	return (
		<CommandBoxWrapper>
			{ commands.map( ( commandName, index ) => {
				const prevIndex = ( currentCommandIndex - 1 + commands.length ) % commands.length;
				if ( currentCommandIndex !== index && prevIndex !== index ) {
					return null;
				}

				return (
					<CommandBox
						className={ clsx( {
							'command-box__fadeIn': currentCommandIndex === index,
							'command-box__fadeOut': prevIndex === index,
						} ) }
						key={ index }
					>
						{ commandName?.icon }
						{ commandName?.label }
					</CommandBox>
				);
			} ) }
		</CommandBoxWrapper>
	);
};

export function HostingCommandPaletteBanner( { className }: HostingCommandPaletteBannerProps ) {
	const translate = useTranslate();
	const isSmallScreen = useMediaQuery( '(max-width: 600px)' );
	if ( isSmallScreen ) {
		return null;
	}

	return (
		<HostingCommandPaletteBannerRoot>
			<DismissibleCard
				preferenceName="hosting-command-palette-banner-display"
				className={ `hosting-command-palette-banner is-dismissible ${ className }` }
			>
				<ShortcutIcon size="big" />
				<div>
					<BannerTitle>{ translate( 'The Command Palette is here' ) }</BannerTitle>
					<BannerDescription>
						{ translate(
							// Translators: {{shortcut/}} is "⌘K" or "Ctrl+K" depending on the user's OS.
							'Access features and trigger commands quickly. Press {{shortcut/}} to launch the Command Palette.',
							{
								components: { shortcut: <ShortcutIcon size="small" /> },
							}
						) }
					</BannerDescription>
				</div>
				<AnimatedCommand />
			</DismissibleCard>
		</HostingCommandPaletteBannerRoot>
	);
}
