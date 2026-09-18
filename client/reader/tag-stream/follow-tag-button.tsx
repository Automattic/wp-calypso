import { Button } from '@wordpress/components';
import { check, plus } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import type { JSX } from 'react';

interface TagFollowButtonProps {
	following?: boolean;
	disabled?: boolean;
	tagName?: string;
	onToggle: () => void;
}

export function TagFollowButton( {
	following,
	disabled,
	tagName,
	onToggle,
}: TagFollowButtonProps ): JSX.Element {
	const translate = useTranslate();

	const label = tagName
		? ( ( following
				? translate( 'Unfollow the “%(tagName)s” tag', { args: { tagName } } )
				: translate( 'Follow the “%(tagName)s” tag', { args: { tagName } } ) ) as string )
		: undefined;

	return (
		<Button
			variant={ following ? 'secondary' : 'primary' }
			icon={ following ? check : plus }
			label={ label }
			showTooltip={ !! label }
			disabled={ disabled }
			isBusy={ disabled }
			onClick={ () => onToggle() }
			__next40pxDefaultSize
		>
			{ following ? translate( 'Following' ) : translate( 'Follow' ) }
		</Button>
	);
}
