import { Card, Button } from '@automattic/components';
import classNames from 'classnames';
import customerHomeIllustrationTaskFindDomain from 'calypso/assets/images/domains/free-domain.svg';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

interface EmptyDomainsListCardSkeletonProps {
	className?: string;
	isCompact?: boolean;
	title?: string;
	line?: string;
	secondLine?: string;
	actionURL: string;
	contentType: string;
	action: string;
	secondaryActionURL: string;
	secondaryAction: string;
	showIllustration?: boolean;
}

export const EmptyDomainsListCardSkeleton = ( {
	className,
	isCompact,
	title,
	line,
	secondLine,
	actionURL,
	contentType,
	action,
	secondaryActionURL,
	secondaryAction,
	showIllustration = true,
}: EmptyDomainsListCardSkeletonProps ) => {
	const dispatch = useDispatch();

	const getActionClickHandler =
		( type: string, buttonURL: string, sourceCardType: string ) => () => {
			dispatch(
				recordTracksEvent( 'calypso_empty_domain_list_card_action', {
					button_type: type,
					button_url: buttonURL,
					source_card_type: sourceCardType,
				} )
			);
		};

	const illustration = customerHomeIllustrationTaskFindDomain && (
		<img src={ customerHomeIllustrationTaskFindDomain } alt="" width={ 150 } />
	);

	return (
		<Card className={ classNames( 'empty-domains-list-card', className ) }>
			<div
				className={ classNames( 'empty-domains-list-card__wrapper', {
					'is-compact': isCompact,
					'has-title-only': title && ! line,
				} ) }
			>
				{ showIllustration && (
					<div className="empty-domains-list-card__illustration">{ illustration }</div>
				) }
				<div className="empty-domains-list-card__content">
					<div className="empty-domains-list-card__text">
						{ title ? <h2>{ title }</h2> : null }
						{ line ? <h3>{ line }</h3> : null }
						{ secondLine ? <h3 style={ { fontStyle: 'italic' } }>{ secondLine }</h3> : null }
					</div>
					<div className="empty-domains-list-card__actions">
						<Button
							primary
							onClick={ getActionClickHandler( 'primary', actionURL, contentType ) }
							href={ actionURL }
						>
							{ action }
						</Button>
						<Button
							onClick={ getActionClickHandler( 'secondary', secondaryActionURL, contentType ) }
							href={ secondaryActionURL }
						>
							{ secondaryAction }
						</Button>
					</div>
				</div>
			</div>
			<TrackComponentView
				eventName="calypso_get_your_domain_empty_impression"
				eventProperties={ { content_type: contentType } }
			/>
		</Card>
	);
};
