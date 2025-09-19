import { JetpackLogo } from '@automattic/components/src/logos/jetpack-logo';
import { WordPressLogo } from '@automattic/components/src/logos/wordpress-logo';
import { __experimentalHStack as HStack, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { commentAuthorAvatar, people, globe } from '@wordpress/icons';
import type { ActivityActor as ActivityActorType } from '@automattic/api-core';
import './styles.scss';

const ICON_SIZE = 24;

function getActorPresentation( actor: ActivityActorType ) {
	const { type, name, icon } = actor;
	const unknown = __( 'Unknown' );

	// Map known application/brand actors (v1 parity)
	switch ( type ) {
		case 'Application': {
			if ( name === 'WordPress' ) {
				return { iconEl: <WordPressLogo size={ ICON_SIZE } />, label: name };
			}
			if ( name === 'Jetpack' || name === 'Jetpack Boost' ) {
				return {
					iconEl: <JetpackLogo size={ ICON_SIZE } />,
					label: name,
				};
			}
			if ( name === 'Server' ) {
				return {
					iconEl: <Icon className="server-actor-icon" icon={ globe } size={ ICON_SIZE } />,
					label: __( 'Server' ),
				};
			}
			break;
		}
		case 'Multiple': {
			return { iconEl: <Icon icon={ people } size={ ICON_SIZE } />, label: __( 'Multiple users' ) };
		}
		case 'Happiness Engineer': {
			return { iconEl: <JetpackLogo size={ ICON_SIZE } />, label: __( 'Happiness Engineer' ) };
		}
	}

	// Default: avatar image if present; otherwise generic user icon
	if ( icon?.url ) {
		return {
			iconEl: (
				<img
					className="site-activity-logs__actor-icon"
					src={ icon.url }
					alt={ name || unknown }
					style={ { borderRadius: '50%' } }
					width={ ICON_SIZE }
					height={ ICON_SIZE }
				/>
			),
			label: name || unknown,
		};
	}

	return {
		iconEl: <Icon className="default-actor-icon" icon={ commentAuthorAvatar } size={ ICON_SIZE } />,
		label: name || unknown,
	};
}

export function ActivityActor( { actor }: { actor: ActivityActorType } ) {
	const { iconEl, label } = getActorPresentation( actor );

	return (
		<HStack spacing="2" alignment="left" className="site-activity-logs__actor">
			<div className="site-activity-logs__actor-icon">{ iconEl }</div>
			<span>{ label }</span>
		</HStack>
	);
}
