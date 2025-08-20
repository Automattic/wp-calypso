import { Icon, Spinner } from '@wordpress/components';
import { check, notAllowed, levelUp } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useEligibilityQuery } from 'calypso/data/reader/freshly-pressed/use-eligibility-query';
import { useSuggestionMutation } from 'calypso/data/reader/freshly-pressed/use-suggestion-mutation';
import './style.scss';

interface Props {
	blogId: number | undefined;
	postId: number | undefined;
}
interface IconStatusProps {
	status: 'suggested' | 'published' | 'eligible' | 'not-eligible' | 'loading' | null | undefined;
	onClick?: () => void;
}

const IconStatus = ( { status, onClick }: IconStatusProps ) => {
	if ( status === 'suggested' ) {
		return <Icon className="freshly-pressed-suggestion__state" icon={ check } />;
	}

	if ( status === 'published' ) {
		return <Icon className="freshly-pressed-suggestion__state" icon={ check } />;
	}

	if ( status === 'eligible' ) {
		return (
			<button
				className="freshly-pressed-suggestion__state-button"
				aria-label="Recommend this post for Freshly Pressed (Automatticians only)"
				onClick={ onClick }
			>
				<Icon className="freshly-pressed-suggestion__state" icon={ levelUp } />
			</button>
		);
	}

	if ( status === 'not-eligible' ) {
		return <Icon className="freshly-pressed-suggestion__state" icon={ notAllowed } />;
	}

	if ( status === 'loading' ) {
		return <Spinner className="freshly-pressed-suggestion__loading-spinner" />;
	}
};

export const FreshlyPressed = ( { blogId, postId }: Props ) => {
	const translate = useTranslate();
	const { data, isLoading: isEligibilityLoading } = useEligibilityQuery( {
		blogId,
		postId,
	} );

	const { mutate, isPending: isUpdating } = useSuggestionMutation( {
		blogId,
		postId,
	} );

	const handleClick = useCallback( () => {
		mutate();
	}, [ mutate ] );

	const status = isEligibilityLoading || isUpdating || ! data?.status ? 'loading' : data?.status;
	const isLoading = status === 'loading';

	return (
		<div
			className={ clsx( 'freshly-pressed-suggestion', {
				'freshly-pressed-suggestion--loading': isLoading,
				'freshly-pressed-suggestion--suggested': status === 'suggested',
				'freshly-pressed-suggestion--published': status === 'published',
				'freshly-pressed-suggestion--not-eligible': status === 'not-eligible',
				'freshly-pressed-suggestion--eligible': status === 'eligible',
			} ) }
		>
			<div className="freshly-pressed-suggestion__icon-wrapper-container">
				<div className="freshly-pressed-suggestion__status-text-container">
					{ ! isLoading && status !== 'eligible' && (
						<p className="freshly-pressed-suggestion__status-text">{ data?.details?.reason }</p>
					) }
					{ status === 'eligible' && (
						<p className="freshly-pressed-suggestion__status-text">
							{ translate( 'Recommend this post for Freshly Pressed (Automatticians only)' ) }
						</p>
					) }
				</div>

				<div className="freshly-pressed-suggestion__icon-wrapper">
					<IconStatus
						status={ status }
						onClick={ status === 'eligible' ? handleClick : undefined }
					/>
				</div>
			</div>
		</div>
	);
};
