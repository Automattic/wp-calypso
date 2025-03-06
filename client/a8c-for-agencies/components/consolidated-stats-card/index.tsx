import { Card, Gridicon } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef } from 'react';
import A4APopover from 'calypso/a8c-for-agencies/components/a4a-popover';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import InfoModal from './info-modal';

import './style.scss';

interface CardInfoProps {
	title?: string;
	children?: React.ReactNode;
	wrapperRef: React.RefObject< HTMLElement >;
	footerText: string;
}

const CardInfo = ( { children, wrapperRef, footerText, title }: CardInfoProps ) => {
	const [ showPopover, setShowPopover ] = useState( false );
	const translate = useTranslate();
	const isMobile = useMobileBreakpoint();

	return (
		<>
			<div
				className={ clsx( 'consolidated-stats-card__label-wrapper', {
					mobile: isMobile,
				} ) }
			>
				<div className="consolidated-stats-card__label">
					{ footerText }
					{ ! isMobile && (
						<span
							className="consolidated-stats-card__info-icon"
							onClick={ () => setShowPopover( true ) }
							role="button"
							tabIndex={ 0 }
							onKeyDown={ ( event ) => {
								if ( event.key === 'Enter' ) {
									setShowPopover( true );
								}
							} }
						>
							<Gridicon icon="info-outline" size={ 16 } />
						</span>
					) }
				</div>
				{ isMobile && (
					<Button
						className="consolidated-stats-card__info-mobile"
						onClick={ () => setShowPopover( true ) }
					>
						<Gridicon icon="info-outline" size={ 12 } />
						<span>{ translate( 'More info' ) }</span>
					</Button>
				) }
			</div>
			{ showPopover &&
				( isMobile ? (
					<InfoModal title={ title ?? '' } onClose={ () => setShowPopover( false ) }>
						{ children }
					</InfoModal>
				) : (
					<A4APopover
						title=""
						offset={ 12 }
						wrapperRef={ wrapperRef }
						onFocusOutside={ () => setShowPopover( false ) }
					>
						{ children }
					</A4APopover>
				) ) }
		</>
	);
};

interface ConsolidatedStatsCardProps {
	value: string | number;
	footerText: string;
	popoverTitle?: string;
	popoverContent: React.ReactNode;
	isLoading?: boolean;
}

export function ConsolidatedStatsCard( {
	value,
	footerText,
	popoverTitle,
	popoverContent,
	isLoading = false,
}: ConsolidatedStatsCardProps ) {
	const cardRef = useRef< HTMLDivElement | null >( null );

	return (
		<Card compact ref={ cardRef }>
			<div className="consolidated-stats-card__value">
				{ isLoading ? <TextPlaceholder /> : value }
			</div>
			<CardInfo title={ popoverTitle } wrapperRef={ cardRef } footerText={ footerText }>
				<div className="consolidated-stats-card__popover-content">{ popoverContent }</div>
			</CardInfo>
		</Card>
	);
}

interface ConsolidatedStatsGroupProps {
	className?: string;
	children: React.ReactNode;
}

export function ConsolidatedStatsGroup( { className, children }: ConsolidatedStatsGroupProps ) {
	return <div className={ clsx( 'consolidated-stats-group', className ) }>{ children }</div>;
}
