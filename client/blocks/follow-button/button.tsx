import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React from 'react';

import './style.scss';

export interface FollowButtonProps {
	className?: string;
	disabled?: boolean;
	followIcon?: JSX.Element;
	followLabel?: string;
	following?: boolean;
	followingIcon?: JSX.Element;
	followingLabel?: string;
	hasButtonStyle?: boolean;
	iconSize?: number;
	onFollowToggle?: ( following: boolean ) => void;
	tagName?: keyof JSX.IntrinsicElements;
}

/**
 * Button to show and toggle follow states.
 */
export default function FollowButton( props: FollowButtonProps ): JSX.Element {
	const translate = useTranslate();
	let label: string = props.followLabel ? props.followLabel : translate( 'Subscribe' );
	const menuClasses: string[] = [ 'button', 'follow-button', 'has-icon' ];
	const iconSize = props.iconSize || 20;

	if ( props.className ) {
		menuClasses.push( props.className );
	}

	if ( props.following ) {
		menuClasses.push( 'is-following' );
		label = props.followingLabel ? props.followingLabel : translate( 'Subscribed' );
	}

	if ( props.disabled ) {
		menuClasses.push( 'is-disabled' );
	}

	if ( props.hasButtonStyle ) {
		menuClasses.push( 'has-button-style' );
	}

	const followingIcon = props.followingIcon || (
		<Gridicon key="following" icon="reader-following" size={ iconSize } />
	);
	const followIcon = props.followIcon || (
		<Gridicon key="follow" icon="reader-follow" size={ iconSize } />
	);

	/**
	 * Toggle the follow state of the button.
	 */
	function toggleFollow( event: React.MouseEvent ): void {
		if ( event ) {
			event.preventDefault();
		}

		if ( props.disabled ) {
			return;
		}

		if ( props.onFollowToggle ) {
			props.onFollowToggle( ! props.following );
		}
	}

	const FollowButtonTag: keyof JSX.IntrinsicElements = props.tagName || 'button';

	return (
		<FollowButtonTag className={ menuClasses.join( ' ' ) } title={ label } onClick={ toggleFollow }>
			{ followingIcon }
			{ followIcon }
			<span className="follow-button__label">{ label }</span>
		</FollowButtonTag>
	);
}
