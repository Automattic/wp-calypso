import { Button, Icon } from '@wordpress/components';
import { check as CheckIcon } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useFreshlyPressedMutation } from 'calypso/data/reader/use-freshly-pressed-mutation';
import './style.scss';

interface Props {
	blogId: number;
	postId: number;
	children: React.ReactNode;
}

const AutomatticIcon = ( { size = 20, viewBox = '0 0 20 20', className = '' } ) => (
	<svg
		className={ clsx( 'sidebar__menu-icon sidebar_svg-a8c', className ) }
		fill="transparent"
		height={ size }
		viewBox={ viewBox }
		width={ size }
		xmlns="http://www.w3.org/2000/svg"
	>
		<g strokeLinecap="round" strokeWidth="1.5">
			<path
				d="m10 17.5c4.5563 0 8.25-3.3579 8.25-7.5 0-4.14214-3.6937-7.5-8.25-7.5-4.55635 0-8.25 3.35786-8.25 7.5 0 4.1421 3.69365 7.5 8.25 7.5z"
				strokeLinejoin="round"
			/>
			<path d="m11.75 7.25-3.5 5.5" />
		</g>
	</svg>
);

export const FreshlyPressedRecommendationButton = ( { blogId, postId }: Props ) => {
	const { mutate, isPending, isSuccess } = useFreshlyPressedMutation( {
		blogId,
		postId,
	} );
	const translate = useTranslate();

	const handleClick = useCallback( () => {
		mutate();
	}, [ mutate ] );

	return (
		<Button
			className={ clsx( 'freshly-pressed-button', {
				'freshly-pressed-button--success': isSuccess,
			} ) }
			variant="primary"
			onClick={ handleClick }
			disabled={ isPending }
			icon={
				isSuccess ? (
					<Icon icon={ CheckIcon } size={ 12 } className="freshly-pressed-button__icon" />
				) : (
					<AutomatticIcon size={ 12 } className="freshly-pressed-button__icon" />
				)
			}
			iconPosition="left"
			isBusy={ isPending }
		>
			{ ! isSuccess && translate( 'Recommend this post to Freshly Pressed' ) }
			{ isSuccess && translate( 'Recommended' ) }
		</Button>
	);
};
