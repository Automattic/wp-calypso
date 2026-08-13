import { Button } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
import clsx from 'clsx';
import { useCallback, useState, type ReactNode } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import SimpleList from '../simple-list';

import './style.scss';

type Props = {
	title: ReactNode;
	items: ReactNode[];
	ctaLabel: ReactNode;
	ctaUrl: string;
	footnote?: ReactNode;
	toggleEventName: string;
	ctaEventName: string;
};

const PressableOfferBanner = ( {
	title,
	items,
	ctaLabel,
	ctaUrl,
	footnote,
	toggleEventName,
	ctaEventName,
}: Props ) => {
	const dispatch = useDispatch();

	const [ isExpanded, setIsExpanded ] = useState( true );

	const onToggleView = useCallback( () => {
		dispatch(
			recordTracksEvent( toggleEventName, {
				event_type: isExpanded ? 'collapse' : 'expand',
			} )
		);
		setIsExpanded( ( isExpanded ) => ! isExpanded );
	}, [ dispatch, isExpanded, toggleEventName ] );

	const onCtaClick = useCallback(
		( e: React.MouseEvent< HTMLAnchorElement | HTMLButtonElement > ) => {
			e.stopPropagation();
			dispatch( recordTracksEvent( ctaEventName ) );
		},
		[ dispatch, ctaEventName ]
	);

	return (
		<div
			className={ clsx( 'a4a-pressable-offer', { 'is-expanded': isExpanded } ) }
			onClick={ onToggleView }
			role="button"
			tabIndex={ 0 }
			onKeyDown={ ( event ) => {
				if ( event.key === 'Enter' || event.key === ' ' ) {
					event.preventDefault();
					onToggleView();
				}
			} }
		>
			<div className="a4a-pressable-offer__main">
				<h3 className="a4a-pressable-offer__title">
					<span>{ title }</span>

					<Button className="a4a-pressable-offer__view-toggle-mobile">
						<Icon icon={ chevronDown } size={ 24 } />
					</Button>
				</h3>

				{ isExpanded && (
					<div className="a4a-pressable-offer__body">
						<SimpleList items={ items } />

						<div className="a4a-pressable-offer__body-actions">
							<Button
								variant="secondary"
								href={ ctaUrl }
								target="_blank"
								rel="noopener noreferrer"
								onClick={ onCtaClick }
							>
								{ ctaLabel }
							</Button>

							{ footnote && (
								<span className="a4a-pressable-offer__body-actions-footnote">{ footnote }</span>
							) }
						</div>
					</div>
				) }
			</div>
			<Button className="a4a-pressable-offer__view-toggle">
				<Icon icon={ chevronDown } size={ 24 } />
			</Button>
		</div>
	);
};

export default PressableOfferBanner;
