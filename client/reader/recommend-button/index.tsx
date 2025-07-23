import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import ReaderFollowFeedIcon from '../components/icons/follow-feed-icon';
import ReaderFollowingFeedIcon from '../components/icons/following-feed-icon';
import './style.scss';

interface Props {
	isRecommended: boolean;
	onClick: () => void;
	isLoading?: boolean;
}

export const RecommendButton = ( { isRecommended = false, onClick, isLoading = false }: Props ) => {
	const translate = useTranslate();

	const Icon = isRecommended ? ReaderFollowingFeedIcon : ReaderFollowFeedIcon;
	const classes = clsx( 'reader-recommend-button', {
		'is-recommended': isRecommended,
	} );

	return (
		<Button
			icon={ <Icon iconSize={ 24 } /> }
			className={ classes }
			onClick={ onClick }
			variant="secondary"
			disabled={ isLoading }
			aria-label={
				isRecommended
					? translate( 'Remove from recommended list' )
					: translate( 'Add to recommended list' )
			}
		>
			{ isRecommended ? translate( 'Recommended' ) : translate( 'Recommend this blog' ) }
		</Button>
	);
};
