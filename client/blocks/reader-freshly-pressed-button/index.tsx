import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Spinner } from '@wordpress/components';
import { check, levelUp, notAllowed, Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import { useEligibilityQuery } from 'calypso/data/reader/freshly-pressed/use-eligibility-query';
import { useSuggestionMutation } from 'calypso/data/reader/freshly-pressed/use-suggestion-mutation';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

import './style.scss';

interface Props {
	blogId: number;
	postId: number;
	isLoading?: boolean;
}

type Status =
	| 'suggested'
	| 'published'
	| 'eligible'
	| 'not-eligible'
	| 'loading'
	| null
	| undefined;

const getIcon = ( status: Status ) => {
	if ( [ 'suggested', 'published' ].includes( status ?? '' ) ) {
		return check;
	}

	if ( status === 'not-eligible' ) {
		return notAllowed;
	}

	if ( status === 'eligible' ) {
		return levelUp;
	}

	return null;
};

export const ReaderFreshlyPressedButton = ( { blogId, postId }: Props ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { data: eligibility, isLoading: isEligibilityLoading } = useEligibilityQuery( {
		blogId: blogId,
		postId: postId,
	} );

	const getLabel = () => {
		if ( eligibility?.status === 'suggested' ) {
			return eligibility?.details?.reason;
		}
		if ( eligibility?.status === 'published' ) {
			return translate( 'Post already published' );
		}
		if ( eligibility?.status === 'eligible' ) {
			return translate( 'Suggest this post for Freshly Pressed' );
		}

		if ( eligibility?.status === 'not-eligible' ) {
			return eligibility?.details?.reason;
		}
	};

	const {
		mutate: suggestPost,
		isPending: isSuggestionPending,
		isSuccess: isSuggestionSuccess,
		error: suggestionError,
	} = useSuggestionMutation( {
		blogId: blogId,
		postId: postId,
	} );

	const isEligible = eligibility?.status === 'eligible';
	const isLoading = isEligibilityLoading || isSuggestionPending;
	const statusIcon = getIcon( isLoading ? 'loading' : eligibility?.status );

	const handleClick = useCallback( () => {
		recordTracksEvent( 'calypso_reader_freshly_pressed_suggest_post', {
			blog_id: blogId,
			post_id: postId,
		} );
		suggestPost();
	}, [ blogId, postId, suggestPost ] );

	useEffect( () => {
		if ( suggestionError ) {
			dispatch( errorNotice( suggestionError.message ) );
		}
	}, [ suggestionError, dispatch ] );

	useEffect( () => {
		if ( isSuggestionSuccess ) {
			dispatch( successNotice( translate( 'Post suggested for Freshly Pressed' ) ) );
		}
	}, [ isSuggestionSuccess, dispatch, translate ] );
	const label = getLabel();

	return (
		<div
			className={ clsx(
				'freshly-pressed',
				`freshly-pressed--is-status-${ eligibility?.status ?? 'loading' }`
			) }
			aria-label={ label }
			aria-busy={ isLoading }
		>
			<button
				data-tooltip={ label }
				onClick={ handleClick }
				disabled={ ! isEligible || isLoading || isSuggestionSuccess }
				className="freshly-pressed__button"
			>
				{ statusIcon && <Icon size={ 20 } icon={ statusIcon } /> }
				{ isLoading && <Spinner className="freshly-pressed__spinner" /> }
				{ translate( 'Freshly Press' ) }
			</button>
		</div>
	);
};
