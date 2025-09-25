import { JetpackLogo } from '@automattic/components/src/logos/jetpack-logo';
import { WordPressLogo } from '@automattic/components/src/logos/wordpress-logo';
import { __experimentalHStack as HStack, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { commentAuthorAvatar, globe } from '@wordpress/icons';
import type { ActivityActor } from '@automattic/api-core';
import './activity-actor.scss';

const ICON_SIZE = 24;

function getActorPresentation( actor?: ActivityActor ) {
	let actorName = __( 'Unknown' );

	if ( ! actor ) {
		return {
			icon: null,
			label: actorName,
		};
	}

	const { name, type, icon } = actor;
	actorName = name || actorName;

	// Map known application/brand actors (v1 parity)
	switch ( type ) {
		case 'Application': {
			if ( name === 'WordPress' ) {
				return {
					icon: (
						<WordPressLogo
							className="site-activity-logs__actor-icon-wordpress"
							size={ ICON_SIZE }
						/>
					),
					label: name,
				};
			}
			if ( name === 'Jetpack' || name === 'Jetpack Boost' ) {
				return {
					icon: (
						<JetpackLogo className="site-activity-logs__actor-icon-jetpack" size={ ICON_SIZE } />
					),
					label: name,
				};
			}
			if ( name === 'Server' ) {
				return {
					icon: (
						<Icon
							className="site-activity-logs__actor-icon-server"
							icon={ globe }
							size={ ICON_SIZE }
						/>
					),
					label: __( 'Server' ),
				};
			}
			break;
		}
		case 'Happiness Engineer': {
			return {
				icon: <JetpackLogo className="site-activity-logs__actor-icon-jetpack" size={ ICON_SIZE } />,
				label: __( 'Happiness Engineer' ),
			};
		}
	}

	// Default: avatar image if present; otherwise generic user icon
	if ( icon?.url ) {
		return {
			icon: (
				<img
					className="site-activity-logs__actor-icon-avatar"
					src={ icon.url }
					alt={ actorName }
					width={ ICON_SIZE }
					height={ ICON_SIZE }
				/>
			),
			label: actorName,
		};
	}

	return {
		icon: (
			<Icon
				className="site-activity-logs__actor-icon-default"
				icon={ commentAuthorAvatar }
				size={ ICON_SIZE }
			/>
		),
		label: actorName,
	};
}

type ActivityActorProps = {
	actor?: ActivityActor;
};

export function ActivityActor( { actor }: ActivityActorProps ) {
	const { icon, label } = getActorPresentation( actor );

	return (
		<HStack spacing="2" alignment="left" className="site-activity-logs__actor">
			{ icon }
			<span>{ label }</span>
		</HStack>
	);
}
