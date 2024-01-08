import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import DismissibleCard from 'calypso/blocks/dismissible-card';
import { useCommandsArrayWpcom } from './wpcom-smp-commands';

const HostingCommandPaletteBannerRoot = styled.div( {
	marginBottom: 25,
	'.hosting-command-palette-banner': {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'left',
		borderLeftWidth: 3,
		borderLeftColor: 'var(--color-accent)',
		borderLeftStyle: 'solid',
		padding: '10px 12px',
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
	transform: translateX(-15%);
  }
  100% {
	transform: translateX(-50%);
  }
`;

const CommandBoxWrapper = styled.div( {
	marginLeft: 'auto',
	display: 'grid',
	gridTemplateColumns: '1fr',
	flexGrow: 1,
	paddingRight: 44,
} );

const CommandBox = styled.div( {
	gridRowStart: 1,
	gridColumnStart: 1,
	border: '1px solid var(--studio-gray-5)',
	borderRadius: 2,
	display: 'flex',
	justifyContent: 'flex-start',
	alignItems: 'center',
	opacity: 0,
	transition: 'opacity 1s ease-in-out',
	marginLeft: 'auto',
	minWidth: 253,
	fontSize: 13,
	lineHeight: '20px',
	letterSpacing: -0.15,
	'&.command-box__fadeIn': {
		animation: `${ fadeIn } 1s ease-in-out`,
		opacity: 1,
	},
	'&.command-box__fadeOut': {
		animation: `${ fadeOut } 1s ease-in-out`,
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

const AnimatedCommand = () => {
	const commands = useCommandsArrayWpcom( {
		setSelectedCommandName: () => {},
	} );
	const prefersReducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	const [ currentCommandIndex, setCurrentCommandIndex ] = useState( 0 );
	const commandNames = useMemo( () => {
		if ( prefersReducedMotion ) {
			return [];
		}
		return [
			'registerDomain',
			'openReader',
			'addNewPost',
			'viewMySites',
			'openHostingConfiguration',
			'changePHPVersion',
			'manageStagingSites',
		].map( ( commandName ) => {
			const command = commands.find( ( command ) => command.name === commandName );
			return {
				icon: command?.icon,
				label: command?.label,
			};
		} );
	}, [ commands, prefersReducedMotion ] );

	useEffect( () => {
		if ( prefersReducedMotion ) {
			return;
		}

		const interval = setInterval( () => {
			setCurrentCommandIndex( ( prevIndex ) => ( prevIndex + 1 ) % commandNames.length );
		}, 3000 );

		return () => clearInterval( interval );
	}, [ prefersReducedMotion, commandNames.length ] );

	if ( prefersReducedMotion ) {
		return null;
	}
	return (
		<CommandBoxWrapper>
			{ commandNames.map( ( commandName, index ) => {
				const prevIndex = ( currentCommandIndex - 1 + commandNames.length ) % commandNames.length;
				if ( currentCommandIndex !== index && prevIndex !== index ) {
					return null;
				}

				return (
					<CommandBox
						className={ classNames( {
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
