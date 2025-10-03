import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { Spinner } from '@wordpress/components';
import { check, levelUp, Icon } from '@wordpress/icons';
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

	return levelUp;
};

export const ReaderFreshlyPressedButton = ( { blogId, postId }: Props ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { data: eligibility, isLoading: isEligibilityLoading } = useEligibilityQuery( {
		blogId: blogId,
		postId: postId,
	} );

	const isMobile = useMobileBreakpoint();

	const getLabel = () => {
		switch ( eligibility?.status ) {
			case 'published':
			case 'suggested':
				return {
					label: isMobile
						? translate( 'Suggested' )
						: translate( 'Post suggested for Freshly Pressed' ),
					tooltip: eligibility?.details?.reason,
				};
			case 'eligible':
			case 'not-eligible':
				return {
					label: isMobile ? translate( 'Suggest' ) : translate( 'Suggest for Freshly Pressed' ),
					tooltip: eligibility?.details?.reason,
				};
			default:
				return {
					label: translate( 'Loading…' ),
					tooltip: null,
				};
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

	const config = getLabel();

	return (
		<div
			className={ clsx(
				'freshly-pressed',
				`freshly-pressed--is-status-${ eligibility?.status ?? 'loading' }`
			) }
			aria-label={ config?.label }
			aria-busy={ isLoading }
		>
			<button
				{ ...( config?.tooltip && { 'data-tooltip': config.tooltip } ) }
				onClick={ handleClick }
				disabled={ ! isEligible || isLoading || isSuggestionSuccess }
				className={ clsx( 'freshly-pressed__button', {
					'freshly-pressed__button--has-tooltip': config?.tooltip,
				} ) }
			>
				{ statusIcon && <Icon size={ 20 } icon={ statusIcon } /> }
				{ isLoading && <Spinner className="freshly-pressed__spinner" /> }
				{ config?.label }
			</button>
		</div>
	);
};
